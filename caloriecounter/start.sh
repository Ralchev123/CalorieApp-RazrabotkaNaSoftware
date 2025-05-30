
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Стартиране на приложението..."

if [ ! -f "/app/backend/nutrition.db" ]; then
    log "Създаване на базата данни..."
    cd /app/backend && node database.js
fi

log "Стартиране на backend сървър..."
cd /app/backend && node server.js &
BACKEND_PID=$!

sleep 5

if ! kill -0 $BACKEND_PID 2>/dev/null; then
    log "ГРЕШКА: Backend сървърът не успя да се стартира"
    exit 1
fi

log "Backend стартиран успешно (PID: $BACKEND_PID)"

log "Стартиране на frontend сървър..."
cd /app/frontend && npx serve -s build -l 3000 &
FRONTEND_PID=$!

sleep 3

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    log "ГРЕШКА: Frontend сървърът не успя да се стартира"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

log "Frontend стартиран успешно (PID: $FRONTEND_PID)"
log "Приложението е готово!"
log "Frontend: http://localhost:3000"
log "Backend API: http://localhost:5000"

cleanup() {
    log "Спиране на приложението..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID 2>/dev/null
    wait $FRONTEND_PID 2>/dev/null
    log "Приложението е спряно."
    exit 0
}

trap cleanup SIGTERM SIGINT

wait