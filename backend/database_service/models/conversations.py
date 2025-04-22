from django.db import models
from django.utils import timezone
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank, SearchHeadline, TrigramSimilarity
from database_service.models.users import User
from django.contrib.postgres.aggregates import StringAgg
from django.db.models import F, Q
from django.db.models.functions import Greatest

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
    Search conversations by c_rawmessages and c_name with relevance ranking and highlighted previews, filtered by user_id.
    
    Args:
        search_term (str): The term to search for.
        user_id (int): The user ID to filter conversations by.
    
    Returns:
        Queryset: Conversations matching the search term and user_id, ranked by relevance, with previews.
    """

    vector_rawmessages = SearchVector('c_rawmessages', config='english')
    vector_name = SearchVector('c_name', config='english')
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

    trigram_similarity_rawmessages = TrigramSimilarity('c_rawmessages', search_term)
    trigram_similarity_name = TrigramSimilarity('c_name', search_term)

    # Combine full-text search and trigram similarity
    results = Conversation.objects.filter(u_id=user_id, c_deleted=False).annotate(
        search_rawmessages=vector_rawmessages,
        search_name=vector_name,
        rank_rawmessages=SearchRank(vector_rawmessages, query),
        rank_name=SearchRank(vector_name, query),
        similarity_rawmessages=trigram_similarity_rawmessages,
        similarity_name=trigram_similarity_name,
        headline=headline,
        combined_score=Greatest('rank_rawmessages', 'similarity_rawmessages', 'rank_name', 'similarity_name')  # Combine scores for ranking
    ).filter(
        Q(search_rawmessages=query) | Q(search_name=query) | 
        Q(similarity_rawmessages__gt=0.1) | Q(similarity_name__gt=0.1)  # Include both full-text and trigram matches
    ).order_by('-c_created_at', '-combined_score')
    
    return results
    