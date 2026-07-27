/**
 * Central model configuration.
 *
 * Model selection is a cost decision, not a quality one — see the margin
 * analysis in the pricing config. Chat is high-volume and runs on Haiku;
 * document generation is low-volume and quality-critical, so it runs on Sonnet.
 *
 * Model IDs are exact strings with no date suffix. The previous
 * `claude-sonnet-4-20250514` was retired on 2026-06-15 and now 404s.
 */

/** Agent chat — highest volume path. ~$0.0055 per message at typical context. */
export const CHAT_MODEL = 'claude-haiku-4-5'

/** Proposals, contracts, briefs — low volume, long output, quality matters. */
export const DOCUMENT_MODEL = 'claude-sonnet-5'

/** Bulk transaction categorisation — mechanical, runs over many rows. */
export const CATEGORISE_MODEL = 'claude-haiku-4-5'

/** Daily strategic brief — short, runs once per user per day. */
export const BRIEF_MODEL = 'claude-haiku-4-5'
