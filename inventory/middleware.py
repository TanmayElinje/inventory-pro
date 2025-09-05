from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async

@database_sync_to_async
def get_user(token_key):
    """
    This function is now self-contained and only imports what it needs,
    when it needs it, preventing startup errors.
    """
    from rest_framework_simplejwt.tokens import AccessToken
    from django.contrib.auth.models import User
    try:
        token = AccessToken(token_key)
        user_id = token['user_id']
        return User.objects.get(pk=user_id)
    except Exception:
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = dict(qp.split('=') for qp in query_string.split('&') if '=' in qp)
        token = query_params.get('token', None)

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
