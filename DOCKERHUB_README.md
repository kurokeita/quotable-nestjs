# Quotable API

Quotable is a free, open-source quotations API. It was built to support teachers, students, writers, researchers, or anyone else who needs access to quotations for their work.

## Features

- RESTful API interface.
- Using PostgreSQL.
- Built with NestJS and Sequelize.
- Fully documented API with Swagger.
- Docker support.

## [API Reference](https://quotable.kurokeita.dev)

## Available environment variables

- `NODE_ENV`: `development` or `production`. Set to `development` for a debug run with SQL queries logging.
- `RESOURCE_PROTECTION`: `true` or `false`. Set to `true` to enable resource protection.
- `RESOURCE_MANIPULATION_API_KEY`: 32 characters long string, required if `RESOURCE_PROTECTION` is set to `true`.
- `DB_HOST`
- `DB_PORT`
- `DB_PASSWORD`
- `DB_USER`
- `DB_NAME`
- `APP_PORT`

## Run the docker image

```sh
  docker run --name {CONTAINER_NAME} \
    -e NODE_ENV="production" \
    -e RESOURCE_PROTECTION="true" \
    -e RESOURCE_MANIPULATION_API_KEY="{RESOURCE_MANIPULATION_API_KEY}" \
    -e DB_HOST="{DB_HOST}" \
    -e DB_PORT="{DB_PORT}" \
    -e DB_PASSWORD="{DB_PASSWORD}" \
    -e DB_USER="{DB_USER}" \
    -e DB_NAME="{DB_NAME}" \
    -p {APP_PORT}:{APP_PORT} \
    {tag_name}
```

## License

This project is [MIT](./LICENSE) licensed.
