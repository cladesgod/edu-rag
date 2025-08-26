from celery import Celery
from apps.api.app.config import config


def create_celery_app() -> Celery:
    """Create Celery app with centralized configuration."""
    app = Celery(
        "edu_rag_workers",
        broker=config.CELERY_BROKER_URL,
        backend=config.CELERY_RESULT_BACKEND,
        include=["apps.workers.tasks"],
    )
    
    # Industry standard Celery configuration
    app.conf.update(
        task_track_started=True,
        task_time_limit=900,  # 15 minutes max per task
        task_soft_time_limit=800,  # Soft limit at 13 minutes
        worker_prefetch_multiplier=1,  # Process one task at a time for better resource management
        task_acks_late=True,  # Acknowledge tasks after completion
        worker_disable_rate_limits=False,
        task_reject_on_worker_lost=True,
        task_serializer='json',
        result_serializer='json',
        accept_content=['json'],
        result_expires=3600,  # Results expire after 1 hour
        timezone='UTC',
        enable_utc=True,
    )
    
    return app


celery_app = create_celery_app()


