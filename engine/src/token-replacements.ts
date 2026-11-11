/**
 * What the `would-create-token` replacements under one player's control make
 * of one token-creation event. Pure over its arguments: `Game` reads the
 * replacements off the battlefield and mints what this returns.
 *
 * The event is a list of kinds of token and how many of each. A replacement
 * that can apply changes it, and the changed event is what the next one sees
 * (rule 616.1): Quina's Frog is a creature token, so Queen Allenal's "one or
 * more creature tokens" applies to a Treasure with Quina beside her, after
 * Quina and only after. Each applies once to the event (rule 614.5), and all
 * that can apply must. The order is the controller's (616.1), and the order
 * taken is the one that makes the most tokens, worked out rather than asked
 * (the user's call for counters, 2026-10-14: `Game.counterTotal`). Doublers
 * take no part in the search: last is always at least as good, since they
 * double everything else, so they multiply what it returns. A multiplier of
 * only some tokens (Ojer Taq) is in the search: it matters whether another
 * replacement has made its kind of token yet.
 */
import type { CardType } from "./cards.js";
import type { TokenKindFilter, TokenMultiplierReplacement } from "./replacements.js";
import { hasSubtype } from "./subtypes.js";

/** What a token would be created as: its copiable types and subtypes. */
export interface TokenKind {
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
}

/** One kind of token an event makes. `null` is the token the effect named,
 * with everything it said about what that token is. Anything else is a token
 * made in its place or beside it, by name, which gets only what the effect
 * does to the tokens. */
export interface PlannedTokens {
  readonly name: string | null;
  readonly count: number;
  /** Of a named token's `count`, how many stand in place of the token the
   * effect named (Divine Visitation's Angels) rather than beside it
   * (Chatterfang's Squirrels): those enter as the effect said its tokens
   * enter. None when absent. */
  readonly inPlace?: number;
}

/** One replacement in the search; `key` tells copies of a card apart. */
export interface TokenReplacementInstance {
  readonly key: string;
  readonly replacement: TokenMultiplierReplacement;
}

export interface TokenPlan {
  readonly tokens: readonly PlannedTokens[];
  /** Which `plusOneToken` replacements were used, by `key`: each has had its
   * one opportunity at this event (rule 614.5), for the rest of the event's
   * tokens if the effect makes several kinds. */
  readonly used: readonly string[];
}

export function tokenKindMatches(kind: TokenKind, filter: TokenKindFilter | undefined): boolean {
  if (filter === undefined) return true;
  if (filter.type !== undefined && !kind.types.includes(filter.type)) return false;
  if (filter.subtypesAnyOf !== undefined && !filter.subtypesAnyOf.some((s) => hasSubtype(kind.subtypes, s))) {
    return false;
  }
  return true;
}

/** Stop branching on orders past this many states: only a board of dozens of
 * different replacements reaches it, and the order tried first is a good one. */
const MAX_SEARCHED_STATES = 2000;

interface Search {
  readonly base: TokenKind;
  readonly kindOf: (name: string) => TokenKind;
  readonly cap: number;
  readonly memo: Map<string, { readonly tokens: readonly PlannedTokens[]; readonly used: readonly string[] }>;
}

function kindsOf(search: Search, name: string | null): TokenKind {
  return name === null ? search.base : search.kindOf(name);
}

function addTo(
  tokens: readonly PlannedTokens[],
  name: string,
  count: number,
  cap: number,
  inPlace = 0,
): readonly PlannedTokens[] {
  if (count <= 0) return tokens;
  const at = tokens.findIndex((t) => t.name === name);
  const made = (total: number, standing: number): PlannedTokens => {
    const capped = Math.min(total, cap);
    return standing > 0 ? { name, count: capped, inPlace: Math.min(standing, capped) } : { name, count: capped };
  };
  if (at < 0) return [...tokens, made(count, inPlace)];
  return tokens.map((t, i) => (i === at ? made(t.count + count, (t.inPlace ?? 0) + inPlace) : t));
}

function applies(search: Search, r: TokenMultiplierReplacement, tokens: readonly PlannedTokens[]): boolean {
  const filter = r.ofTokens ?? (r.creatureTokensInstead !== undefined ? { type: "creature" as const } : undefined);
  return tokens.some((t) => t.count > 0 && tokenKindMatches(kindsOf(search, t.name), filter));
}

function applyOne(
  search: Search,
  r: TokenMultiplierReplacement,
  tokens: readonly PlannedTokens[],
): readonly PlannedTokens[] {
  const total = tokens.reduce((sum, t) => sum + t.count, 0);
  if (r.plusOneToken !== undefined) return addTo(tokens, r.plusOneToken, 1, search.cap);
  if (r.plusTokens !== undefined) return addTo(tokens, r.plusTokens, total, search.cap);
  const instead = r.tokensInstead ?? r.creatureTokensInstead;
  const filter = r.ofTokens ?? (r.creatureTokensInstead !== undefined ? { type: "creature" as const } : undefined);
  const matching = (t: PlannedTokens): boolean => tokenKindMatches(kindsOf(search, t.name), filter);
  // Ojer Taq's "three times that many" of the tokens `ofTokens` names.
  if (r.instead?.modify.times !== undefined) {
    const by = r.instead.modify.times;
    return tokens.map((t) => {
      if (!matching(t)) return t;
      const count = Math.min(t.count * by, Math.max(search.cap, t.count));
      return t.inPlace === undefined ? { name: t.name, count } : { name: t.name, count, inPlace: Math.min(t.inPlace * by, count) };
    });
  }
  // How many of the tokens replaced stood for the effect's own.
  const standing = (ts: readonly PlannedTokens[]): number =>
    ts.reduce((sum, t) => sum + (t.name === null ? t.count : (t.inPlace ?? 0)), 0);
  if (instead !== undefined) {
    const that = tokens.filter(matching).reduce((sum, t) => sum + t.count, 0);
    return addTo(
      tokens.filter((t) => !matching(t)),
      instead,
      that,
      search.cap,
      standing(tokens.filter(matching)),
    );
  }
  if (r.oneOfEach !== undefined) {
    const that = tokens.filter(matching).reduce((sum, t) => sum + t.count, 0);
    const stood = standing(tokens.filter(matching));
    let out: readonly PlannedTokens[] = tokens.filter((t) => !matching(t));
    for (const name of r.oneOfEach) out = addTo(out, name, that, search.cap, stood);
    return out;
  }
  return tokens;
}

/** Which order to try first, for a tie: what adds tokens before what changes
 * them, so Divine Visitation, last, makes Chatterfang's Squirrels Angels too. */
function rank(r: TokenMultiplierReplacement): number {
  if (r.plusOneToken !== undefined) return 0;
  if (r.oneOfEach !== undefined) return 1;
  if (r.plusTokens !== undefined) return 2;
  return 3;
}

function best(
  search: Search,
  tokens: readonly PlannedTokens[],
  remaining: readonly TokenReplacementInstance[],
): { readonly tokens: readonly PlannedTokens[]; readonly used: readonly string[] } {
  const key = `${JSON.stringify(tokens)}|${remaining.map((i) => i.key).join(",")}`;
  const known = search.memo.get(key);
  if (known !== undefined) return known;
  const sum = (ts: readonly PlannedTokens[]): number => ts.reduce((n, t) => n + t.count, 0);
  let answer: { readonly tokens: readonly PlannedTokens[]; readonly used: readonly string[] } | undefined;
  const tried = new Set<string>();
  for (const instance of remaining) {
    if (!applies(search, instance.replacement, tokens)) continue;
    // Copies of one card are one choice.
    const shape = JSON.stringify(instance.replacement);
    if (tried.has(shape)) continue;
    tried.add(shape);
    const after = best(
      search,
      applyOne(search, instance.replacement, tokens),
      remaining.filter((i) => i !== instance),
    );
    const result =
      instance.replacement.plusOneToken !== undefined
        ? { tokens: after.tokens, used: [instance.key, ...after.used] }
        : after;
    if (answer === undefined || sum(result.tokens) > sum(answer.tokens)) answer = result;
    if (search.memo.size > MAX_SEARCHED_STATES) break;
  }
  const out = answer ?? { tokens, used: [] };
  search.memo.set(key, out);
  return out;
}

/**
 * The tokens an event of `count` tokens of kind `base` makes.
 *
 * @param replacements the non-doubling `would-create-token` replacements that
 *   haven't yet had their opportunity at this event.
 * @param multiplier the product of the doublers, applied last.
 * @param kindOf what a token definition, by name, is.
 * @param cap the most of a named token one event mints
 *   (`Game.MAX_EFFECT_INSTANCES`).
 */
export function planTokenEvent(
  base: TokenKind,
  count: number,
  replacements: readonly TokenReplacementInstance[],
  multiplier: number,
  kindOf: (name: string) => TokenKind,
  cap: number,
): TokenPlan {
  const original: readonly PlannedTokens[] = [{ name: null, count }];
  if (count <= 0 || replacements.length === 0) {
    return { tokens: [{ name: null, count: count * multiplier }], used: [] };
  }
  const ordered = [...replacements].sort((a, b) => rank(a.replacement) - rank(b.replacement));
  const { tokens, used } = best({ base, kindOf, cap, memo: new Map() }, original, ordered);
  return {
    tokens: tokens.map((t) => {
      const made = t.name === null ? t.count * multiplier : Math.min(t.count * multiplier, cap);
      return t.inPlace === undefined
        ? { name: t.name, count: made }
        : { name: t.name, count: made, inPlace: Math.min(t.inPlace * multiplier, made) };
    }),
    used,
  };
}
