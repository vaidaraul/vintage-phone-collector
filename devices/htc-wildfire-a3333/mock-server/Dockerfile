FROM python:3.14-slim

WORKDIR /app
COPY --chown=10001:10001 server.py /app/server.py

USER 10001:10001
EXPOSE 8080
CMD ["python3", "server.py", "--host", "0.0.0.0", "--port", "8080"]
