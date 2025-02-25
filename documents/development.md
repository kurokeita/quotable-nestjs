# Development

## Project setup

```bash
# install dependencies
$ pnpm install
$ cp .env.example .env
```

Set the appropriate environment variables in the `.env` file.

## Compile and run the project

```bash
# development
$ pnpm start:dev

# debug development with HMR
$ pnpm start:dev:debug

# ddebug evelopment without HMR
$ pnpm start:debug

# production mode
$ pnpm start:prod

# migrate database
$ pnpm migrate:up

# migration generate
$ pnpm migrate:generate

# migration undo
$ pnpm migrate:undo

# migration fresh
$ pnpm migrate:fresh
```

## Resources

A few resources that will help you get started:

- [NestJS docs](https://docs.nestjs.com/)
- [Drizzle](https://orm.drizzle.team/)
- [Vercel](https://vercel.com/): free serverless platform
- [Supabase](https://supabase.com/): free PostgreSQL database
