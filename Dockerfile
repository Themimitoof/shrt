FROM node:12-alpine

WORKDIR /opt/shrt
COPY . /opt/shrt

RUN adduser shrt -D -u 1010 && \
    chown shrt /opt/shrt && \
    cp docker-entrypoint.sh /entrypoint.sh && \
    chmod +x /entrypoint.sh

USER 1010

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "index.js"]
