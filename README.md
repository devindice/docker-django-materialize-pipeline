# docker-django-materialize-pipeline
## Docker Container
https://hub.docker.com/repository/docker/devindice/django-materialize

Getting Started
Make sure pip is installed
sudo apt-get install python3-pip

Type:
# Activate an environment only for this app. This will be unique per app to prevent conflicts with other apps.
source app/venv/bin/activate

# Install packages with pip. Keep the reqirements file up to date as this will be used during pipeline deployment.
pip install -r requirements.txt