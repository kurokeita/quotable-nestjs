# Development

## Project setup

```bash
# install dependencies
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn start:dev

# debug development with HMR
$ yarn start:dev:debug

# ddebug evelopment without HMR
$ yarn start:debug

# production mode
$ yarn start:prod

# migrate database
$ yarn migrate:up

# migration generate
$ yarn migrate:generate

# migration undo
$ yarn migrate:undo

# migration fresh
$ yarn migrate:fresh
```

## Resources

A few resources that will help you get started:

- [NestJS docs](https://docs.nestjs.com/)
- [Sequelize](https://sequelize.org/)
- [Vercel](https://vercel.com/): free serverless platform
- [Supabase](https://supabase.com/): free PostgreSQL database