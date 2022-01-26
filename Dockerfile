FROM python:3.9 AS bendBuild
WORKDIR /api

# Install dependencies
COPY api /api/
RUN chmod +x start.sh
RUN apt update && apt install python3.9-venv build-essential python3-dev -y --no-install-recommends

# Setup venv
RUN python3.9 -m venv venv
ENV PATH="/api/venv/bin:$PATH"
RUN pip install -r requirements.txt

FROM node:10.19.0 AS fendBuild
WORKDIR /app

# Install dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm i

# Build app
COPY public /app/public/
COPY src /app/src/
RUN npm run build

FROM nginx:latest
ENV PATH="/api/venv/bin:$PATH"
ENV FLASK_ENV=production
ENV MONGODB_HOST=mongodb://localhost:27017/gsmanager
ENV GSM_STORAGE_PATH=/storage

# Ensure up to date
RUN apt update && apt upgrade -y --no-install-recommends

# Frontend
WORKDIR /app
COPY --from=fendBuild /app/build/ /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Backend
WORKDIR /api
RUN apt install python3-dev -y --no-install-recommends
COPY --from=bendBuild /api/ /api/

CMD ["/api/start.sh"]