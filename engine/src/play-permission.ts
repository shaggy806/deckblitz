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

import type { TriggeredAbility } from "./abilities.js";
import type { CardType, StaticCondition } from "./cards/define.js";
import type { TypePatch } from "./characteristics-patch.js";
import type { Expiry, PermissionDuration } from "./duration.js";
import type { EffectSpec, PlayerScope } from "./effects.js";
import type { CardFilter } from "./filter.js";
import type { SpendAs } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";

/** The zones a permission reaches. `"library-top"` is the top card of the
 * permission holder's library — or, on a resolved rule whose `whose` names
 * them, another player's (Xanathar, Guild Kingpin); `"hand"` another player's
 * hand. */
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
 * - `alsoPaying`, `payLife`, `sacrifice` (+ `sacrificeCount`), `exileOthers` + `exileFilter`, `discard`,
 *   `costIncreasePerOther`, `do` (an action, the `cost-acts.ts` table: "by
 *   removing a counter from a creature you control"): additional costs (601.2f),
 *   paid in full or not offered (601.2h).
 * - `tax`: "costs {N} more" for a spell cast this way, an increase (601.2f);
 *   `opponentsOnly`, not for the player whose effect gave it (Soul Partition).
 * - `reduce`: "spells you cast this way cost {N} less" (generic only).
 * - `affinity`: "if you do, it has affinity for [those]" (Chiss-Goria, Forge
 *   Tyrant's "for artifacts", `{ type: "artifact" }`): a spell cast under this
 *   permission on a card costs {1} less for each permanent matching it the
 *   caster controls (rule 702.41a), beside any affinity it prints (702.41b).
 * - `undaunted`: "that spell has undaunted" (702.125).
 * - `spendAs`: how mana may pay for a spell cast this way, and no other
 *   (118.14, 609.4b).
 * - `using`: "you may cast this card from your graveyard **using its mutate
 *   ability**" (Brokkos, Apex of Forever), "… its bestow ability"
 *   (Detective's Phoenix): a cast under this permission pays the card's own
 *   keyword cost of that name (`CardDefinition.overload`'s `keyword`) and no
 *   other — not its mana cost, not another alternative cost (the rulings;
 *   rule 118.9a). Another permission reaching the card keeps its own costs
 *   (601.3).
 *
 * How often:
 * - `oncePerTurn`: one play a turn among everything this source gives it.
 * - `perType`: Muldrotha's: once a turn per permanent type, the player naming
 *   which a multi-typed card spends; `"land"` is what lets it play a land.
 *   Given over cards, one play of each type among them all, for as long as
 *   the grant lasts — Aminatou's Augury's "for each nonland card type, you
 *   may cast a spell of that type from among the exiled cards" (a
 *   `GameState.permissionGroups` entry's `types`; the cast names the type
 *   in `graveyardGrant.asType`).
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
 * - `gainsTriggered`: "if you do, it gains '[trigger]'" (Serra Paragon): the
 *   spell cast this way, and the permanent it becomes (rule 400.7 — a
 *   `castRider`), or the land played this way as it enters, has these for as
 *   long as it's that object.
 * - `becomes`: "if you do, it … is a Vampire in addition to its other types"
 *   (The Tomb of Aclazotz): the spell cast this way, on the stack and as the
 *   permanent it becomes (rule 400.7 — a `castRider`), for as long as it's
 *   that object. Spells only.
 * - `whenCast`: "**when you cast it** this turn, [effect]" (Havengul Lich): a
 *   delayed triggered ability of the effect that gave the permission (rule
 *   603.7), which finds the spell only when it's cast this way (400.7h). It
 *   triggers as the spell is cast, its controller the one who was given it
 *   and casts it, its trigger object the spell, and its `"source"` the
 *   permanent whose effect gave the permission, in the stint it had then
 *   (`by`, bound by the engine as the permission is given). A permission
 *   kept on the card only (`grant-play`, `impulse-exile`, an `exile`'s
 *   `mayPlay`), spells only: The Ruinous Powers' "when you cast a spell this
 *   way, its owner loses life equal to its mana value" is an `impulse-exile`'s.
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
  /** `sacrifice` takes this many — Scourge of Nel Toth's "by paying {B}{B}
   * and **sacrificing two creatures**". Which ones is chosen as the cost is
   * paid (601.2h), once the spell is on the stack and its mana paid, as
   * `additionalCost.sacrificeCount`'s are; without it, one, named on the
   * cast. */
  readonly sacrificeCount?: number;
  readonly exileOthers?: number;
  readonly exileFilter?: CardFilter;
  readonly discard?: number;
  readonly do?: EffectSpec;
  readonly costIncreasePerOther?: CardFilter;
  readonly tax?: { readonly generic: number; readonly opponentsOnly?: true };
  readonly reduce?: number;
  readonly affinity?: CardFilter;
  readonly undaunted?: true;
  readonly spendAs?: SpendAs;
  readonly using?: "mutate" | "bestow" | "cleave" | "awaken";

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
  readonly gainsTriggered?: readonly TriggeredAbility[];
  readonly becomes?: TypePatch;
  readonly whenCast?: {
    readonly effect: EffectSpec;
    readonly text: string;
    /** Written by the engine as the permission is given, never authored:
     * the permanent whose effect gave it, in its stint then, and that
     * effect's controller — "you". */
    readonly by?: { readonly id: ObjectId; readonly zoneChangeCount: number; readonly controller: PlayerId };
  };
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
 * - `anyGraveyard`: with `from: "graveyard"`, "from among cards in
 *   graveyards" — every player's, not only the holder's (Coram, the
 *   Undertaker). The card goes to its owner's graveyard or wherever as usual.
 * - `landAndSpell`: "you may play a land **and** cast a spell" (Coram): two
 *   allowances a turn, one land played and one spell cast, each spent apart
 *   (`GameObject.playUses`'s `land` and `spell`). With `play`. Another
 *   permission's plays don't spend them (Coram's rulings).
 * - `eachPlayer`: **every** player holds it, not only the permanent's
 *   controller — Share the Spoils' "during each player's turn, that player
 *   may play a land or cast a spell from among cards exiled with this
 *   enchantment" (with `yourTurnOnly`, `linked` and `oncePerTurn`: one play a
 *   turn, spent on the permanent, by whoever's turn it is). A play under it
 *   is announced with the permanent (`spell-cast` / `land-played`'s
 *   `permission`), for the permanent's "when they do" (`plays-card`'s
 *   `underThis`).
 */
export interface StaticPlay extends PlayTerms {
  readonly from: Exclude<PlayFrom, "hand">;
  readonly exiledByYou?: boolean;
  readonly linked?: boolean;
  readonly anyGraveyard?: true;
  readonly landAndSpell?: true;
  readonly eachPlayer?: true;
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
   * same effect gave it (`upTo`, or `perType`: the types the group has left). */
  readonly group?: number;
}

/** The permanent, in that stint, whose permission a card was played under —
 * on the `spell-cast` and `land-played` events. */
export interface PlayedUnder {
  readonly source: ObjectId;
  readonly stint: number;
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
  | "reduce"
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
  "sacrificeCount",
  "exileOthers",
  "exileFilter",
  "discard",
  "do",
  "costIncreasePerOther",
  "tax",
  "reduce",
  "affinity",
  "undaunted",
  "spendAs",
  "using",
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
  "gainsTriggered",
  "becomes",
  "whenCast",
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
