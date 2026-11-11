/**
 * Play permissions: "you may play this card from there" (rule 601.3), one
 * vocabulary however the permission arises. See
 * `docs/plans/need-key-themes.md`, theme 10's design note.
 *
 * {@link PlayTerms} is what a permission says, the same on a static, a resolved
 * effect, one card, or a `cast-now`. A permission is kept in one of four places:
 *
 * - {@link StaticPlay} on a static ability, while the permanent has it;
 * - {@link EffectPlay} on a `PlayerEffect`, a resolved rule that reaches cards
 *   arriving later (rule 611.2c);
 * - {@link CardPlayPermission} on the one card (`GameObject.playPermission`),
 *   gone with any move (rule 400.7);
 * - {@link SelfPlay} on a card definition, its own text (rule 113.6f).
 *
 * `Game.playOptions` reads all of them. A permission answers only "from
 * there": timing (but for `flash`), targets, payment and prohibitions stay the
 * cast's own.
 */

import type { CardType, StaticCondition } from "./cards/define.js";
import type { Expiry, PermissionDuration } from "./duration.js";
import type { EffectSpec, PlayerScope } from "./effects.js";
import type { CardFilter } from "./filter.js";
import type { SpendAs } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";

/** The zones a permission reaches. `"library-top"` is the top card of the
 * permission holder's library; `"hand"` another player's hand. */
export type PlayFrom = "graveyard" | "exile" | "library-top" | "hand";

/**
 * What a permission says.
 *
 * What it reaches:
 * - `play`: "you may **play**", a land too, with a land drop and a land's
 *   timing (rules 305.1, 305.2, 305.3). Absent, "you may **cast**", and a land
 *   stays where it is (305.9).
 * - `filter`: which cards, read from the holder's side. Judged as the face
 *   played for a static's or a resolved effect's (601.3e, Ancient Greenwarden's
 *   ruling), as the card for one naming that card (Narset's "noncreature,
 *   nonland cards").
 * - `spell`: which spells, always as the face cast (601.3e). Lands aren't spells.
 *
 * What it costs. Nothing here applies to a land, which has no cost:
 * - `free`: `true`, "without paying its mana cost", and only that way;
 *   `{ filter? }`, "you may cast it without paying", beside paying for it. An
 *   alternative cost (118.9): none other goes with it (118.9a), additional
 *   costs and increases still do (118.9d), X is 0 (107.3b).
 * - `byPaying` (mana) / `byPayingLife` (life equal to its mana value): the
 *   alternative cost "rather than its mana cost", and only that way under this
 *   permission (Bolas's Citadel, Raffine's Guidance). Another permission reaching
 *   the card may still let it be cast for its mana cost (601.3).
 * - `byDiscarding`, `byPayingEnergy`: `cast-now`'s alone.
 * - `alsoPaying`, `payLife`, `sacrifice`, `exileOthers` + `exileFilter`, `discard`,
 *   `costIncreasePerOther`, `do` (an action, the `cost-acts.ts` table: "by
 *   removing a counter from a creature you control"): additional costs (601.2f),
 *   paid in full or not offered (601.2h).
 * - `tax`: "costs {N} more" for a spell cast this way, an increase (601.2f);
 *   `opponentsOnly`, not for the player whose effect gave it (Soul Partition).
 * - `reduce`: "spells you cast this way cost {N} less" (generic only).
 * - `undaunted`: "that spell has undaunted" (702.125).
 * - `spendAs`: how mana may pay for a spell cast this way, and no other
 *   (118.14, 609.4b).
 *
 * How often:
 * - `oncePerTurn`: one play a turn among everything this source gives it.
 * - `perType`: Muldrotha's: once a turn per permanent type, the player naming
 *   which a multi-typed card spends; `"land"` is what lets it play a land.
 * - `upTo`: this many plays in all under this permission, "a spell from among
 *   those cards".
 *
 * When, besides `duration`:
 * - `yourTurnOnly`: during the holder's own turn.
 * - `gate`: while a condition holds, read live.
 * - `sourceDid`: only during a turn the holder did this with the source, in the
 *   stint it was in then, whatever has become of it since.
 * - `flash`: "if you cast a spell this way, you may cast it as though it had
 *   flash" (Elsha of the Infinite): the one thing a permission says about
 *   timing. A cast under this permission may begin any time its caster has
 *   priority (rules 601.3c, 702.8a); the same card under another permission
 *   that reaches it (Bolas's Citadel's, for life) keeps its own timing.
 *
 * Afterwards:
 * - `exileAfter`: "if it would be put into a graveyard, exile it instead";
 *   `"instants-and-sorceries"` only for those (Scholar of the Lost Trove).
 * - `gainsHaste`: "if you cast a creature spell this way, it gains haste".
 * - `landsEnterTapped`: "each land played this way enters tapped".
 * - `entersWith`: a permanent spell or land played this way enters with these
 *   counters (Cemetery Prowler's finality counters).
 */
export interface PlayTerms {
  readonly play?: boolean;
  readonly filter?: CardFilter;
  readonly spell?: CardFilter;

  readonly free?: boolean | { readonly filter?: CardFilter };
  readonly byPaying?: string;
  readonly byPayingLife?: boolean;
  readonly byDiscarding?: boolean;
  readonly byPayingEnergy?: boolean;
  readonly alsoPaying?: string;
  readonly payLife?: number;
  readonly sacrifice?: CardFilter;
  readonly exileOthers?: number;
  readonly exileFilter?: CardFilter;
  readonly discard?: number;
  readonly do?: EffectSpec;
  readonly costIncreasePerOther?: CardFilter;
  readonly tax?: { readonly generic: number; readonly opponentsOnly?: true };
  readonly reduce?: number;
  readonly undaunted?: true;
  readonly spendAs?: SpendAs;

  readonly oncePerTurn?: boolean;
  readonly perType?: readonly CardType[];
  readonly upTo?: number;

  readonly yourTurnOnly?: boolean;
  readonly gate?: StaticCondition;
  readonly sourceDid?: "attacked" | "lore-counter" | "attacked-with-a-token";
  readonly flash?: true;

  readonly exileAfter?: boolean | "instants-and-sorceries";
  readonly gainsHaste?: boolean;
  readonly landsEnterTapped?: true;
  readonly entersWith?: { readonly kind: string; readonly amount: number };
}

/**
 * What an effect gives over a card or cards: the terms and how long.
 *
 * - `duration`: read from the side of the player it's given to ("until the end
 *   of **their** next turn").
 * - `byOwner`: "its owner may play it" rather than the effect's controller.
 * - `whileSource`: "from among cards exiled with [this]" as an ability of it:
 *   usable only while the source is on the battlefield as the same object
 *   (400.7), on top of `duration`.
 * - `fromNextTurn`: not this turn (warp, rule 702.185a).
 */
export interface PlayGrant extends PlayTerms {
  readonly duration: PermissionDuration;
  readonly byOwner?: boolean;
  readonly whileSource?: boolean;
  readonly fromNextTurn?: true;
}

/**
 * A static ability's permission: while its permanent has the ability, its
 * controller may play matching cards from `from`.
 *
 * - `exiledByYou`: "cards you exiled" (Haldan), an effect of this player's.
 * - `linked`: "from among cards exiled with this creature" (607.2a), its
 *   present stint only, so a thief who gains control may use it.
 */
export interface StaticPlay extends PlayTerms {
  readonly from: Exclude<PlayFrom, "hand">;
  readonly exiledByYou?: boolean;
  readonly linked?: boolean;
}

/**
 * A `player-effect`'s permission as a card writes it: a rule for the effect's
 * duration, so it reaches cards that get there later.
 *
 * - `whose`: whose zones it reaches, read as it resolves: `"each-player"` is
 *   The Great Work's "from any graveyard", a slot Sen Triplets' "that player's
 *   hand". Absent: the holder's own.
 * - `linked`: "from among cards exiled with this artifact" (Idol of Endurance,
 *   rule 607.2a): that stint's, for as long as this lasts, even once the source
 *   has left (113.7a).
 */
export interface EffectPlaySpec extends PlayTerms {
  readonly from: PlayFrom;
  readonly whose?: PlayerScope;
  readonly linked?: true;
}

/** An {@link EffectPlaySpec} once it has resolved. `left` counts `upTo` down;
 * `stint` is the source's, for a `linked` one. */
export interface EffectPlay extends Omit<EffectPlaySpec, "whose" | "upTo"> {
  readonly source: ObjectId;
  readonly owners?: readonly PlayerId[];
  readonly stint?: number;
  readonly left?: number;
}

/** What a card's own text allows (rule 113.6f): `from` the zones it names,
 * its owner, while `if` holds. */
export interface SelfPlay extends PlayTerms {
  readonly from: readonly ("graveyard" | "exile")[];
  readonly if?: StaticCondition;
}

/** A permission over one card. Ends with any move of the card (rule 400.7). */
export interface CardPlayPermission extends Omit<PlayTerms, "upTo"> {
  readonly player: PlayerId;
  readonly expiry: Expiry;
  /** Whose effect gave it: `tax.opponentsOnly`'s exemption. */
  readonly granter?: PlayerId;
  /** Not usable before this turn. */
  readonly fromTurn?: number;
  /** The permanent it's linked to, in the stint it was in then. */
  readonly source?: { readonly id: ObjectId; readonly zoneChangeCount: number };
  readonly whileSource?: boolean;
  /** The `GameState.permissionGroups` entry it shares with the other cards the
   * same effect gave it (`upTo`). */
  readonly group?: number;
}

/** The {@link PlayTerms} a `cast-now` takes: what the spell may be and what it
 * costs, the words every permission uses. It's a decision during a resolution
 * (rule 608.2g), so it has no duration and no limit of its own. */
export type CastNowTerms = Pick<
  PlayTerms,
  | "play"
  | "spell"
  | "free"
  | "byDiscarding"
  | "byPayingEnergy"
  | "byPaying"
  | "byPayingLife"
  | "alsoPaying"
  | "spendAs"
  | "gainsHaste"
  | "exileAfter"
>;

/**
 * The cost a permission puts on one card:
 * - `"free-only"`: cast only without paying its mana cost;
 * - `"free-may"`: may be, and may be paid for;
 * - `"life"`: only for life equal to its mana value;
 * - `"mana"`: only for its `byPaying`;
 * - `"paid"`: for its mana cost.
 */
export type PlayCostMode = "free-only" | "free-may" | "life" | "mana" | "paid";

export function playCostMode(terms: PlayTerms, freeFilterMatches: boolean): PlayCostMode {
  if (terms.free === true) return "free-only";
  if (typeof terms.free === "object" && freeFilterMatches) return "free-may";
  if (terms.byPayingLife === true) return "life";
  if (terms.byPaying !== undefined) return "mana";
  return "paid";
}

/** What a permission spends each time it's used. Nothing means a player who
 * can use a permission that spends nothing should, when two reach a card. */
export function playSpendsSomething(terms: PlayTerms): boolean {
  return terms.oncePerTurn === true || terms.perType !== undefined || terms.upTo !== undefined;
}

/** The keys of a {@link PlayGrant}: what `grantOf` keeps of an effect's own
 * spec, which also has `kind`, `amount`, `cards` and the like. */
const PLAY_GRANT_KEYS = [
  "play",
  "filter",
  "spell",
  "free",
  "byPaying",
  "byPayingLife",
  "byDiscarding",
  "byPayingEnergy",
  "alsoPaying",
  "payLife",
  "sacrifice",
  "exileOthers",
  "exileFilter",
  "discard",
  "do",
  "costIncreasePerOther",
  "tax",
  "reduce",
  "undaunted",
  "spendAs",
  "oncePerTurn",
  "perType",
  "upTo",
  "yourTurnOnly",
  "gate",
  "sourceDid",
  "flash",
  "exileAfter",
  "gainsHaste",
  "landsEnterTapped",
  "entersWith",
  "duration",
  "byOwner",
  "whileSource",
  "fromNextTurn",
] as const satisfies readonly (keyof PlayGrant)[];

/** Every key of a {@link PlayGrant} is listed above: a new term that isn't
 * fails this line. */
type MissingGrantKeys = Exclude<keyof PlayGrant, (typeof PLAY_GRANT_KEYS)[number]>;
const _everyGrantKeyListed: MissingGrantKeys extends never ? true : never = true;
void _everyGrantKeyListed;

/** Just the {@link PlayGrant} of an effect spec that extends it. */
export function playGrantOf(spec: PlayGrant): PlayGrant {
  const out: Record<string, unknown> = {};
  const from = spec as unknown as Record<string, unknown>;
  for (const key of PLAY_GRANT_KEYS) {
    if (from[key] !== undefined) out[key] = from[key];
  }
  return out as unknown as PlayGrant;
}
