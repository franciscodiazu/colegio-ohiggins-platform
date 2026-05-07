FROM ubuntu:latest
LABEL authors="RAPOS"

ENTRYPOINT ["top", "-b"]