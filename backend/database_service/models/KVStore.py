from django.db import models
import json
import pickle
from asgiref.sync import sync_to_async

# Django model remains the same.
class KeyValueStore(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    value_type = models.CharField(max_length=20, default='str')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key

    class Meta:
        indexes = [
            models.Index(fields=['key']),
        ]


class SqliteKVStore:
    """A key-value store wrapper for SQLite using Django models, with async support."""
    
    def __init__(self, namespace=None):
        self.namespace = namespace
        
    def _format_key(self, key):
        """Add namespace to key if namespace exists"""
        if self.namespace:
            return f"{self.namespace}:{key}"
        return key

    async def get(self, key, default=None):
        """Asynchronously get a value for key, return default if not found"""
        try:
            kv = await sync_to_async(KeyValueStore.objects.get)(key=self._format_key(key))
            return self._deserialize_value(kv.value, kv.value_type)
        except KeyValueStore.DoesNotExist:
            return default

    async def set(self, key, value):
        """Asynchronously set a value for key"""
        formatted_key = self._format_key(key)
        value_str, value_type = self._serialize_value(value)
        await sync_to_async(KeyValueStore.objects.update_or_create)(
            key=formatted_key,
            defaults={'value': value_str, 'value_type': value_type}
        )
        return True

    async def delete(self, key):
        """Asynchronously delete a key"""
        try:
            kv = await sync_to_async(KeyValueStore.objects.get)(key=self._format_key(key))
            await sync_to_async(kv.delete)()
            return True
        except KeyValueStore.DoesNotExist:
            return False

    async def keys(self, pattern=None):
        """Asynchronously get all keys, optionally filtered by pattern"""
        queryset = KeyValueStore.objects.all()
        if self.namespace:
            queryset = queryset.filter(key__startswith=f"{self.namespace}:")
        if pattern:
            queryset = queryset.filter(key__contains=pattern)
        keys_list = await sync_to_async(list)(queryset.only('key'))
        return [
            k.key.split(':', 1)[1] if self.namespace else k.key
            for k in keys_list
        ]

    def _serialize_value(self, value):
        """Convert Python value to string and record its type"""
        if isinstance(value, str):
            return value, 'str'
        elif isinstance(value, int):
            return str(value), 'int'
        elif isinstance(value, float):
            return str(value), 'float'
        elif isinstance(value, bool):
            return str(int(value)), 'bool'
        elif isinstance(value, (dict, list)):
            return json.dumps(value), 'json'
        else:
            # For complex objects, use pickle (less safe but flexible)
            return pickle.dumps(value).hex(), 'pickle'
    
    def _deserialize_value(self, value_str, value_type):
        """Convert stored string back to original Python type"""
        if value_type == 'str':
            return value_str
        elif value_type == 'int':
            return int(value_str)
        elif value_type == 'float':
            return float(value_str)
        elif value_type == 'bool':
            return bool(int(value_str))
        elif value_type == 'json':
            return json.loads(value_str)
        elif value_type == 'pickle':
            return pickle.loads(bytes.fromhex(value_str))
        else:
            return value_str
