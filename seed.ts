/**
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { copycat, Input } from '@snaplet/copycat'
import { createSeedClient } from '@snaplet/seed'
import { readFileSync } from 'fs'
import { join } from 'path'
import slugify from 'slugify'

type CustomExample = {
  input: string
  examples: string[]
  description: string
}

const setupClient = async () => {
  const dataExamples = JSON.parse(
    readFileSync(join(__dirname, '.snaplet/dataExamples.json'), 'utf-8'),
  )

  const getCustomExamples = (input: string) =>
    dataExamples.find((e: CustomExample) => e.input === input)?.examples ?? []

  const randomUniqueAuthor = (seed: Input) =>
    copycat.oneOfString(seed, getCustomExamples('public authors name'))

  const randomUniqueQuote = (seed: Input) =>
    copycat.oneOfString(seed, getCustomExamples('public quotes content'))

  const randomUniqueTag = (seed: Input) =>
    copycat.oneOfString(seed, getCustomExamples('public tags name'))

  const store = {
    authors: new Set<ReturnType<typeof randomUniqueAuthor>>(),
    quotes: new Set<ReturnType<typeof randomUniqueQuote>>(),
    tags: new Set<ReturnType<typeof randomUniqueTag>>(),
  }

  return await createSeedClient({
    models: {
      authors: {
        data: {
          name: ({ seed }) =>
            copycat.unique(seed, randomUniqueAuthor, store.authors),
          slug: ({ data }) => slugify(data.name as string, { lower: true }),
          description: ({ seed }) =>
            copycat.oneOfString(
              seed,
              getCustomExamples('public authors description'),
            ),
          bio: ({ seed }) =>
            copycat.oneOfString(seed, getCustomExamples('public authors bio')),
          link: ({ seed }) =>
            copycat.oneOfString(seed, getCustomExamples('public authors link')),
          deletedAt: null,
        },
      },
      quotes: {
        data: {
          content: ({ seed }) =>
            copycat.unique(seed, randomUniqueQuote, store.quotes),
          deletedAt: null,
        },
      },
      tags: {
        data: {
          name: ({ seed }) => copycat.unique(seed, randomUniqueTag, store.tags),
          deletedAt: null,
        },
      },
    },
  })
}

const main = async () => {
  const seed = await setupClient()

  // Truncate all tables in the database
  await seed.$resetDatabase(['!**.*migrat*'])

  const { authors } = await seed.authors((x) => x(5))

  const quotes = []

  for (const a of authors) {
    const { quotes: newQuotes } = await seed.quotes((x) =>
      x({ min: 1, max: 5 }, { authorId: a.id as number }),
    )
    quotes.push(...newQuotes)
  }

  const { tags } = await seed.tags((x) => x({ min: 10, max: 20 }))

  for (const q of quotes) {
    const tagsForQuote = copycat
      .someOf(q.id as number, [1, 5], tags)
      .map((t) => ({ quoteId: q.id as number, tagId: t.id as number }))

    await seed.quote_tags(tagsForQuote)
  }

  // Type completion not working? You might want to reload your TypeScript Server to pick up the changes

  console.log('Database seeded successfully!')

  process.exit()
}

main()
