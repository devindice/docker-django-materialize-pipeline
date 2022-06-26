# syntax=docker/dockerfile:1
FROM python:3
RUN apt-get update && apt-get install nginx vim npm -y --no-install-recommends
COPY nginx.default /etc/nginx/sites-available/default
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt /app/
COPY start-server.sh /app/
COPY app/ /app/
#CMD source venv/bin/activate
RUN npm -g install sass yuglify
RUN pip install -r requirements.txt
RUN python3 /app/manage.py collectstatic --noinput
RUN sed -i 's/DEBUG = True/DEBUG = False/g' /app/global/settings.py
RUN chown -R www-data:www-data /app
expose 8020
STOPSIGNAL SIGTERM
CMD ["/app/start-server.sh"]
