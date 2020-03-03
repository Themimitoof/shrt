# Shrt : Stupid simple no-deps url-shortner
_shrt_ is made as simple as possible and only use modules from the standard library.

## Installation
### General installation
After all, create a copy of `config.example.js` file and rename it in
`config.js`. Changes all values to match with your environment (domain name,
exposed port, bind IP).

Inside the `apikey` parameter, you can put what you want but I recommend you to
paste the result of this command:
```bash
openssl rand -hex 32
```

### Manual install
If you want to run directly on your machine, you can use the command
`node index.js` for starting the server.

To run it persistant, you can use supervisor tools like `pm2`, `supervisord`
or use a SystemD unit file for running the service as daemon and when the
machine restarts.

### Docker install
A auto-build image is available on the public Docker registry. You can pull the
image by executing the command:
```bash
docker pull themimitoof/shrt
```

To run the service, you can use this command (adapt it as your needs):
```bash
docker run -it -d --restart=always -p8090 \
    -v $PWD/config.js:/opt/shrt/config.js \
    -v $PWD/db.json:/opt/shrt/db.json \
    shrt
```

You can also use Docker-compose defining the service in YAML and add for
example some labels for Traefik:
```yaml
version: '3'

services:
  shrt:
    image: themimitoof/shrt
    restart: always
    expose:
      - 8090
    networks:
      - web
    volumes:
      - ./data/db.json:/opt/shrt/db.json
      - ./config.js:/opt/shrt/config.js
    labels:
      - "traefik.docker.network=web"
      - "traefik.enable=true"
      - "traefik.basic.protocol=http"
      - "traefik.frontend.rule=Host:shrt.pw"
      - "traefik.basic.port=8090"

networks:
  web:
    external: true
```

Note: If you have a `Error: EISDIR: illegal operation on a directory, read` in
the server's logs, remove the created folder `db.json`, create a new empty file and change the owner to be owned by the UID `1010`.
```bash
rm db.json
touch db.json
chown 1010 db.json
```

## Routes
 * **GET /**: show the message `shrt: Stupid simple no-deps url-shortner is
   running here. Available on: https://github.com/themimitoof/shrt`.
 * **GET /{slug}**: redirect to the un-shortened link. If the link doesn't
   exist in the DB, a superb 404 is sent.
 * **POST /**:
   * Headers:
     * `ApiKey: {apikey}`: authenticate the call for shortening the given URL.
   * Body (in **JSON format**):
     * `link`: link to be shortened
   * Example:
    ```bash
    curl -XPOST -H "Content-Type: application/json" -H "ApiKey: ${SHRT_APIKEY}" -d '{"link": "https://github.com/themimitoof/shrt"}' https://shrt.pw
    ```

## Create an alias for your terminal
In your shell configuration or your `~/.aliases` file, you can add this code
for having an alias `shortner`:
```bash
function shortner() {
    curl -XPOST -H "Content-Type: application/json" -H "ApiKey: ${SHRT_APIKEY}" -d "{\"link\": \"${1}\"}" https://link-to-my-installation.tld
}
```

Inside the same file/separate file, you can export your API key like this:
```bash
export SHRT_APIKEY="2347234U23I4J23I4U23I4OU32IO4U234IU234982U"
```

## TODO
 * Add some "caching" on links for speed up the API and reduce disk IO

## License
This project is release with the [MIT license](LICENSE.md).