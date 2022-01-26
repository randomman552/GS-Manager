FROM nginx:latest
# TODO Split this into multiple build stages
# GS-Manager env variables
ENV FLASK_ENV=production
ENV MONGODB_HOST=mongodb://localhost:27017/gsmanager
ENV GSM_STORAGE_PATH=/storage

# Ensure up to date
RUN apt update && apt upgrade -y

# Frontend
WORKDIR /app
COPY build /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Backend
WORKDIR /api
COPY api /api/
RUN chmod +x start.sh
RUN apt install python3.9 python3.9-venv build-essential python3-dev -y
RUN python3.9 -m venv venv venv
RUN /bin/bash -c "source venv/bin/activate && pip install -r requirements.txt"

CMD ["/api/start.sh"]