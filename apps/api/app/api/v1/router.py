from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, bookings, manager, venues

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(venues.router)
api_router.include_router(bookings.router)
api_router.include_router(manager.router)
api_router.include_router(admin.router)
