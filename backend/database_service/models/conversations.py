from django.db import models
from django.utils import timezone
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, SearchHeadline
from database_service.models.users import User

class Conversation(models.Model):
    c_id = models.AutoField(primary_key=True)
    u_id = models.ForeignKey(User, on_delete=models.CASCADE)
    c_name = models.CharField(max_length=200, default="Untitled")
    c_deleted = models.BooleanField(default=False)
    c_created_at = models.DateTimeField(default=timezone.now)
    c_messages = models.JSONField(default=list)
    
    c_rawmessages = models.TextField(default="")

    def __str__(self):
        return self.c_name
    
def search_conversations(search_term: str, user_id: str):
    """
    Search conversations by c_rawmessages with relevance ranking and highlighted previews, filtered by user_id.
    
    Args:
        search_term (str): The term to search for.
        user_id (int): The user ID to filter conversations by.
    
    Returns:
        Queryset: Conversations matching the search term and user_id, ranked by relevance, with previews.
    """

    vector = SearchVector('c_rawmessages', config='english')
    query = SearchQuery(search_term, config='english')
    headline = SearchHeadline(
        'c_rawmessages',
        query,
        config='english',
        start_sel='<b>',
        stop_sel='</b>',
        max_words=35,
        min_words=15,
    )

    results = Conversation.objects.annotate(
        search=vector,
        rank=SearchRank(vector, query),
        headline=headline
    ).filter(search=query, u_id=user_id, c_deleted=False).order_by('-rank')

    return results
