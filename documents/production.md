# Production build

## Using Docker

### Build and tag the docker image

`docker build --tag {tag_name} .`

### Run the docker image

```sh
  docker run --name {CONTAINER_NAME} \
    -e NODE_ENV="production" \
    -e RESOURCE_PROTECTION="true" \
    -e RESOURCE_MANIPULATION_API_KEY="{RESOURCE_MANIPULATION_API_KEY}" \
    -e DB_DIALECT="{DB_DIALECT}" \
    -e DB_HOST="{DB_HOST}" \
    -e DB_PORT="{DB_PORT}" \
    -e DB_PASSWORD="{DB_PASSWORD}" \
    -e DB_USER="{DB_USER}" \
    -e DB_NAME="{DB_NAME}" \
    -p {APP_PORT}:3000 \
    {tag_name}
```
