/** Colors, mana, and mana costs. */

// Type-only, so nothing here participates in a runtime cycle — `filter.ts`
// and `effects.ts` both import this module for real.
import type { CardType, Keyword, Supertype } from "./cards/define.js";
import type { EffectSpec } from "./effects.js";
import type { CardFilter } from "./filter.js";
import type { ObjectId } from "./primitives.js";
import type { ZoneType } from "./state.js";
import { hasSubtype } from "./subtypes.js";

export type Color = "W" | "U" | "B" | "R" | "G";

/** A concrete unit of mana: one of the five colors, or colorless (`C`). */
export type ManaType = Color | "C";

export type ManaPool = Record<ManaType, number>;

export const COLORS: readonly Color[] = ["W", "U", "B", "R", "G"];
export const MANA_TYPES: readonly ManaType[] = ["W", "U", "B", "R", "G", "C"];

/**
 * What a land tapped for mana produces instead of what its ability says
 * (rules 106.12, 614.1a) — one entry of `StaticAbility.landManaInstead`, or a
 * `player-effect`'s. Only the land's own mana is changed: what triggered mana
 * abilities add on the tap isn't the land's. See `Game.landManaInsteadFor`.
 */
export interface LandManaInstead {
  /** Which lands — "Plains" (Reality Twist), "a nonbasic land" (Pale Moon),
   * "a basic land you control" (Pulse of Llanowar); absent for any land. */
  readonly filter?: CardFilter;
  /** The type it makes. `"any-color"` is "mana of a color of your choice"
   * (Pulse of Llanowar): chosen by whoever tapped it, as it's tapped, one
   * colour for all the land makes (its ruling). */
  readonly produces: ManaType | "any-color";
  /** Whose tap it changes: this permanent's controller's (`"you"` — "if you
   * tap a land for mana") or anyone's (`"any"` — "if a land is tapped"). */
  readonly tapper: "you" | "any";
  /** "Instead of any other **color**" (Hall of Gemstone): {C} isn't a colour,
   * so colorless mana stays as it is (its ruling). */
  readonly colorsOnly?: true;
  /** "Instead of any other type **and amount**" (Contamination): one mana,
   * however much the land would have made. A land that would make none still
   * makes none: there's no mana to replace (rule 106.5). */
  readonly one?: true;
}

/**
 * Every way to add `amount` mana of `colors` as "two mana of different
 * colors" (Firemind Vessel) or "two mana of any one color and two mana of any
 * other color" (Open the Omenpaths): groups of `perColor` units, each group a
 * different colour. The order of the colours doesn't matter, so each way is
 * listed once.
 */
export function differentManaSplits(colors: readonly ManaType[], amount: number, perColor: number): ManaType[][] {
  const groups = Math.floor(amount / Math.max(1, perColor));
  const out: ManaType[][] = [];
  const pick = (from: number, chosen: readonly ManaType[]): void => {
    if (chosen.length === groups) {
      out.push(chosen.flatMap((c) => Array<ManaType>(perColor).fill(c)));
      return;
    }
    for (let i = from; i < colors.length; i += 1) pick(i + 1, [...chosen, colors[i]]);
  };
  if (groups > 0) pick(0, []);
  return out;
}

export const emptyPool = (): ManaPool => ({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 });

export const poolTotal = (pool: ManaPool): number =>
  MANA_TYPES.reduce((sum, type) => sum + pool[type], 0);

/**
 * What a restricted unit of mana may be spent on (rule 106.6) — "Spend this
 * mana only to cast a creature spell of the chosen type" and its relatives.
 *
 * Both clauses are optional and at least one must be set; a unit whose
 * restriction permits neither the spell nor the ability in front of it simply
 * can't pay for it. `text` is for the log and the mana display, and is the
 * card's own wording. `notSpell` is the other shape, a deny-list, and is set
 * alone.
 */
export interface ManaRestriction {
  /** "This mana can't be spent to cast nonartifact spells" (Karn, Legacy
   * Reforged; a Powerstone): a deny-list rather than an allow-list. The
   * mana pays for anything but casting a spell that matches — an artifact
   * spell, any ability, a ward cost, a cost paid as something resolves
   * (Karn's ruling). Set alone, without `spell` / `abilityOf`. */
  readonly notSpell?: CardFilter;
  /** Spells this mana may be cast with (Ancient Ziggurat: any creature
   * spell). Matched against the card being cast, which is still in its
   * pre-cast zone at payment time — so this reads printed characteristics,
   * which is what "a creature spell" means. */
  readonly spell?: CardFilter;
  /** Permanents whose *activated abilities* this mana may also pay for
   * (Eldrazi Temple, Castle Garenbrig: "…or activate abilities of Eldrazi").
   * Absent means the mana is for casting only. Only an ability of a
   * permanent on the battlefield — "abilities of creatures" means creature
   * permanents (rule 109.2), which is Castle Garenbrig's and Eldrazi
   * Temple's ruling — unless `abilityOfAnyZone`. */
  readonly abilityOf?: CardFilter;
  /** `abilityOf` reaches a card's abilities in any zone: "an ability of a
   * creature **source**" (Secluded Courtyard) names a source, not a
   * permanent (rule 109.2a). */
  readonly abilityOfAnyZone?: true;
  /** Only a spell cast from where this says, and matching `spell` if set — see
   * {@link ManaCastFrom}. */
  readonly castFrom?: ManaCastFrom;
  /** "This mana can't be spent to cast spells from your hand" (Heartwood
   * Crafter): a deny-list, as `notSpell` is. It pays for anything but casting a
   * spell from these zones, an ability included. Set alone. */
  readonly notCastFrom?: readonly ZoneType[];
  /** The other things this mana may pay for, beside `spell` and `abilityOf`
   * (or on their own): see {@link ManaSpendPurpose}. */
  readonly purposes?: readonly ManaSpendPurpose[];
  readonly text: string;
}

/**
 * Where a spell must be cast from for this mana to pay for it (rule 106.6):
 * "from your graveyard" (Lord of the Forsaken: `zones` with `yours`, the card's
 * owner the player spending it), "from exile" (Interdimensional Web Watch),
 * "from anywhere other than your hand" (Mm'menon, the Right Hand: `notZones`).
 * `withFlashback` is "spells with flashback from a graveyard" (Altar of the
 * Lost): any graveyard (the rulings), the flashback printed, given by an effect,
 * or the one it's being cast for.
 */
export interface ManaCastFrom {
  readonly zones?: readonly ZoneType[];
  readonly notZones?: readonly ZoneType[];
  readonly yours?: true;
  readonly withFlashback?: true;
}

/**
 * A thing "spend this mana only to …" (rule 106.6) names that isn't a spell
 * or a permanent's abilities by filter:
 *
 * - `"turn-face-up"`: turning a permanent face up (rule 116.2b — Overgrown
 *   Zealot); `"unlock-door"`: unlocking a Room's door (rule 709.5e — Creeping
 *   Peeper). Special actions, so neither is an ability of anything.
 * - `"disturb"`: "to pay a disturb cost" (Unblinking Observer): a spell cast
 *   for its disturb cost (rule 702.146), whatever spell it is.
 * - `"equip-ability"`: an equip ability (Ronin, Shadow Stalker), not every
 *   ability of an Equipment; `"power-up-ability"` (Quinjet Technician, rule
 *   702.193a); `"class-level"`: a Class's level bar (Sorcerer Class, rule
 *   716.2a).
 * - `"cost-with-x"`: "on costs that contain {X}" (Rosheen Meanderer's ruling:
 *   a spell's total cost, an activated ability's cost, a suspend cost, or a
 *   cost asked for as something resolves). All of that cost, not just its X.
 * - `"kicked-spell"`: "to cast kicked spells" (Elfhame Druid; rule 702.33d), all
 *   of the cost, cast with its kicker paid (Volshe Tideturner beside its `spell`).
 * - `"cost-with-c"`: "a cost that contains {C}" (Cultivator Drone): as
 *   `"cost-with-x"`, a spell's total cost, an activated ability's cost, or a cost
 *   asked for otherwise. All of that cost, not just its {C}.
 * - `"foretell"`: "to foretell a card from your hand" (Karfell Harbinger), the
 *   special action's {2} (rule 702.143a).
 * - `"cumulative-upkeep"`: "to pay cumulative upkeep costs" (Adarkar Unicorn, rule
 *   702.24a; `UnlessOption.paysFor`).
 */
export type ManaSpendPurpose =
  | "turn-face-up"
  | "unlock-door"
  | "disturb"
  | "equip-ability"
  | "power-up-ability"
  | "class-level"
  | "cost-with-x"
  | "cost-with-c"
  | "kicked-spell"
  | "foretell"
  | "cumulative-upkeep";

/**
 * How freely a payment may spend mana (rules 118.14, 609.4b): `"any-color"`
 * is "spend mana as though it were mana of any color" — any unit pays a
 * coloured pip, but a `{C}` pip still wants colourless mana; `"any-type"` is
 * "mana of any type can be spent" — any unit pays any pip, `{C}` included.
 * It changes how a cost may be paid, never the cost or what was spent. See
 * `mana-payment.ts`'s `costAsSpendable`.
 */
export type WideSpendAs = "any-color" | "any-type";

/**
 * One type of mana only, spent as though it were one colour or any colour
 * (rule 609.4b): "you may spend white mana as though it were red mana"
 * (Sunglasses of Urza), "colorless mana as though it were mana of any color"
 * (Abstruse Appropriation). A pip keeps its own colour too, so this widens the
 * pip rather than folding it into generic: `mana-payment.ts`'s
 * `pipsAsSpendable`.
 */
export interface SpendUnitAs {
  readonly unit: ManaType;
  readonly as: Color | "any-color";
}

export type SpendAs = WideSpendAs | SpendUnitAs;

/**
 * One unit of mana sitting in a player's pool (rule 106.4).
 *
 * The pool is a **list of units** rather than a count per colour, because
 * three printed things need to know about one *particular* unit of mana and
 * not just how much there is: a restriction on what it may be spent on, a
 * rider that fires when it is spent (Path of Ancestry), and mana that
 * survives the end of a step (Savage Ventmaw). A count can carry none of
 * those. {@link poolCounts} rebuilds the old view for everything that only
 * wants totals.
 *
 * In practice the pool is empty almost all the time — the engine auto-pays,
 * so mana is usually made and spent inside one operation and never lands
 * here. It lands here when a player activates a mana ability by hand, and
 * that is exactly the path where an untagged pool would lose the restriction
 * and let Cavern of Souls' mana pay for anything.
 */
export interface ManaUnit {
  readonly type: ManaType;
  readonly restriction?: ManaRestriction;
  /** "You don't lose this mana as steps and phases end" (Savage Ventmaw).
   * Still emptied at cleanup — the permission is for the turn, not forever. */
  readonly persists?: boolean;
  /** "This mana lasts until end of combat" (firebending): kept as the
   * combat phase's steps end, lost as it does. */
  readonly untilEndOfCombat?: boolean;
  /** "…and that spell can't be countered" (Cavern of Souls, Delighted
   * Halfling) — a property the *spell* gains by being paid for with this
   * mana, so it can't live on the land's own card definition. */
  readonly uncounterable?: boolean;
  /** "If that mana is spent on a [filter] spell, it gains [keywords] until
   * end of turn" (Carnelian Orb of Dragonkind — rule 106.6): what the spell
   * this unit pays for gets, as `add-mana`'s `spellGains` says. */
  readonly spellGains?: { readonly spell?: CardFilter; readonly keywords: readonly Keyword[]; readonly lasting?: true };
  /** Fires when this unit is spent — Path of Ancestry's "When that mana is
   * spent to cast a creature spell that shares a creature type with your
   * commander, scry 1". Carried as plain data so it survives a snapshot. */
  readonly onSpend?: ManaSpendRider;
  /** What made it — see {@link ManaOrigin}. */
  readonly from?: ManaOrigin;
}

/**
 * What made a unit of mana: the card types, subtypes and supertypes of the
 * source of the ability or spell that added it, as they were when it did —
 * "mana from an artifact", "mana from a Treasure". Taken as the mana is
 * made, because the source is often gone by the time the mana is spent (a
 * Treasure sacrificed for it). Extra mana a triggered mana ability adds
 * (rule 605.1b — "whenever you tap a creature for mana, add an additional
 * {G}") is that ability's source's, not the tapped permanent's.
 */
export interface ManaOrigin {
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
  readonly supertypes: readonly Supertype[];
  /** Which permanent made it, and its stint on the battlefield (rule 400.7) —
   * "mana produced by Barracks of the Thousand". */
  readonly object?: ObjectId;
  readonly stint?: number;
}

/** Which sources of mana count — a `CardFilter.manaFrom` clause. Every field
 * given must match. */
export interface ManaFromSpec {
  readonly type?: CardType;
  readonly subtype?: string;
  readonly supertype?: Supertype;
  /** The filter's source itself made it — its current stint on the
   * battlefield. The caller compares that (`CardFilter.manaFrom` does). */
  readonly fromSource?: true;
}

/** Whether mana made by `origin` is mana from what `spec` names. A source
 * that was every creature type (changeling) made mana from each of them. */
export const manaOriginMatches = (origin: ManaOrigin, spec: ManaFromSpec): boolean =>
  (spec.type === undefined || origin.types.includes(spec.type)) &&
  (spec.subtype === undefined || hasSubtype(origin.subtypes, spec.subtype)) &&
  (spec.supertype === undefined || origin.supertypes.includes(spec.supertype));

/** A triggered ability that fires when one unit of mana is spent on a
 * matching spell (rule 106.12 / 603.2e). */
export interface ManaSpendRider {
  /** The permanent that made the mana — `ctx.source` when the rider fires. */
  readonly source: ObjectId;
  readonly sourceName: string;
  /** Only fires if the spell paid for matches. Absent means any spell. */
  readonly spell?: CardFilter;
  readonly effect: EffectSpec;
  readonly text: string;
}

/** Totals per mana type — the count view of a pool of units. */
export const poolCounts = (units: readonly ManaUnit[]): ManaPool => {
  const pool = emptyPool();
  for (const unit of units) pool[unit.type] += 1;
  return pool;
};

/** One way to pay a single hybrid / twobrid / Phyrexian pip (rule 107.4e–g).
 * A pip is a list of these alternatives; paying it means satisfying any one. */
export type HybridOption =
  | { readonly kind: "color"; readonly color: Color }
  /** twobrid — the `{2}` half of `{2/W}` (`amount` is always 2 in practice). */
  | { readonly kind: "generic"; readonly amount: number }
  /** Phyrexian — the `{P}` half of `{W/P}`: pay 2 life instead of the pip. */
  | { readonly kind: "phyrexian" }
  /** Colorless mana, only ever on a pip a payment widened (`pipsAsSpendable`
   * — no printed hybrid symbol has it). */
  | { readonly kind: "colorless" };

/** A single hybrid pip: the alternative payments it accepts, in the symbol's
 * written order (`{2/W}` → `[{2}, {W}]`, `{W/P}` → `[{W}, {P}]`). */
export type HybridPip = readonly HybridOption[];

/** A parsed mana cost: a generic amount plus per-color requirements. */
export interface ManaCost {
  readonly generic: number;
  readonly colored: Record<Color, number>;
  /** `{C}` pips — must be paid with colorless mana specifically (rule 107.4c). */
  readonly colorless: number;
  /** `{S}` pips — each paid with one mana of any type made by a snow source
   * (rule 107.4h; `ManaUnit.from`'s supertypes). A generic cost reduction
   * doesn't touch them (107.4h). Each counts 1 toward mana value. */
  readonly snow: number;
  /** Number of `{X}` symbols in the cost (0 for most cards, 1 for an X spell).
   * The chosen value of X is multiplied by this and added to `generic` when
   * the cost is actually paid — see `Game.effectiveCost`. */
  readonly x: number;
  /** Hybrid / twobrid / Phyrexian pips, each resolved to one of its
   * alternatives at payment time (see `Game.resolveHybridCost`). */
  readonly hybrid: readonly HybridPip[];
  /** Generic reduction left over once the generic part reached `{0}`, for
   * the `{2}` halves of twobrid pips (`{2/W}`) — but only the ones paid with
   * generic mana (the Spectral Procession ruling), which is decided at
   * payment time, so it's carried here rather than baked into a pip. See
   * `reduceManaCost` and `resolveHybridCost`. */
  readonly twobridReduction?: number;
}

function isColor(value: string): value is Color {
  return (
    value === "W" ||
    value === "U" ||
    value === "B" ||
    value === "R" ||
    value === "G"
  );
}

/** Parse one `/`-joined pip body (`"W/U"`, `"2/W"`, `"W/P"`, `"G/U/P"`). */
function parseHybridPip(body: string): HybridPip {
  return body.split("/").map((part): HybridOption => {
    if (/^\d+$/.test(part)) return { kind: "generic", amount: Number(part) };
    if (part === "P") return { kind: "phyrexian" };
    if (isColor(part)) return { kind: "color", color: part };
    throw new Error(`unsupported mana symbol: {${body}}`);
  });
}

/**
 * Parse a cost string like `"{2}{G}{G}"`, `"{X}{R}"`, `"{C}{C}"`, `"{2/W}{2/W}"`,
 * or `"{R/P}"`. Supports generic (`{N}`), the five colored symbols, `{C}`
 * (colorless), `{X}`, `{S}` (snow — `ManaCost.snow`), and hybrid / twobrid /
 * Phyrexian pips (`{W/U}`, `{2/W}`, `{W/P}`).
 */
export function parseManaCost(text: string | null): ManaCost {
  const colored: Record<Color, number> = { W: 0, U: 0, B: 0, R: 0, G: 0 };
  const hybrid: HybridPip[] = [];
  let generic = 0;
  let colorless = 0;
  let snow = 0;
  let x = 0;
  for (const token of text?.match(/\{[^}]+\}/g) ?? []) {
    const symbol = token.slice(1, -1);
    if (/^\d+$/.test(symbol)) {
      generic += Number(symbol);
    } else if (symbol === "X") {
      x += 1;
    } else if (symbol === "C") {
      colorless += 1;
    } else if (symbol === "S") {
      snow += 1;
    } else if (isColor(symbol)) {
      colored[symbol] += 1;
    } else if (symbol.includes("/")) {
      hybrid.push(parseHybridPip(symbol));
    } else {
      throw new Error(`unsupported mana symbol: ${token}`);
    }
  }
  return { generic, colored, colorless, snow, x, hybrid };
}

/** Mana value of one hybrid pip (rule 202.3f): the greatest among its
 * alternatives — `{W/U}` → 1, `{2/W}` → 2, `{W/P}` → 1. */
function hybridPipValue(pip: HybridPip): number {
  return Math.max(
    0,
    ...pip.map((option) => (option.kind === "generic" ? option.amount : 1)),
  );
}

/** How many mana symbols of these colours a cost has (rule 107.4): a hybrid or
 * Phyrexian symbol counts once if it's any of them, as devotion (rule 700.5)
 * and the chroma ability word read it. */
export function colorSymbols(cost: ManaCost, colors: readonly Color[]): number {
  let symbols = 0;
  for (const color of colors) symbols += cost.colored[color];
  for (const pip of cost.hybrid) {
    if (pip.some((o) => o.kind === "color" && colors.includes(o.color))) symbols += 1;
  }
  return symbols;
}

/** Mana value (converted mana cost). `{X}` counts as 0 (rule 202.3f). */
export function manaValue(cost: ManaCost): number {
  return (
    COLORS.reduce((sum, color) => sum + cost.colored[color], cost.generic) +
    cost.colorless +
    cost.snow +
    cost.hybrid.reduce((sum, pip) => sum + hybridPipValue(pip), 0)
  );
}

/**
 * One coloured cost reduction ("costs {W}{B} less" — rule 118.7): how many
 * of each colour it takes off, and whether what finds no coloured pip to take
 * is lost (`coloredOnly` — "this effect reduces only the amount of colored
 * mana you pay") or comes off the generic part instead (rules 118.7b/c).
 */
export interface ColoredReduction {
  readonly colors: Readonly<Record<Color, number>>;
  readonly coloredOnly: boolean;
}

/** A cost string less `by` generic mana (rule 118.7a: only its generic
 * component): `"{4}{W}{U}"` less 2 is `"{2}{W}{U}"`, `"{1}{W}"` less 2 is
 * `"{W}"`, `"{W}{W}"` stays, and one reduced to nothing is `"{0}"` (118.7). */
export function withGenericReducedBy(cost: string, by: number): string {
  let left = by;
  const out = cost.replace(/\{(\d+)\}/g, (_token, digits: string) => {
    const take = Math.min(left, Number(digits));
    left -= take;
    const rest = Number(digits) - take;
    return rest === 0 ? "" : `{${rest}}`;
  });
  return out === "" ? "{0}" : out;
}

/** The coloured symbols of `text` as a per-colour count, for a
 * {@link ColoredReduction} (`"{W}{B}"` → one W, one B). */
export function coloredReductionOf(text: string, coloredOnly: boolean, times = 1): ColoredReduction {
  const colors = { ...parseManaCost(text).colored };
  for (const color of COLORS) colors[color] *= times;
  return { colors, coloredOnly };
}

/** `cost` paid `times` times over, as one payment — a `may`'s `costTimes`,
 * "you may pay {1}{G} any number of times": every symbol of it, that many. */
export function repeatedManaCost(cost: ManaCost, times: number): ManaCost {
  return {
    ...cost,
    generic: cost.generic * times,
    colored: {
      W: cost.colored.W * times,
      U: cost.colored.U * times,
      B: cost.colored.B * times,
      R: cost.colored.R * times,
      G: cost.colored.G * times,
    },
    colorless: cost.colorless * times,
    snow: cost.snow * times,
    hybrid: Array.from({ length: times }, () => cost.hybrid).flat(),
  };
}

/**
 * `cost` with cost reductions applied (rule 601.2f), none of which can take
 * it below nothing.
 *
 * Coloured reductions go first: each takes a pip of its colour, else a hybrid
 * pip that includes the colour (rule 118.7e — that pip is paid as the
 * colour), preferring a twobrid pip since its other half is the dearer one;
 * what's left comes off the generic part unless `coloredOnly`.
 *
 * A generic reduction larger than the generic part carries over as
 * `twobridReduction`, for whichever twobrid pips end up paid with generic
 * mana: rule 601.2f has the payment for each hybrid pip chosen before the
 * total cost is, and a generic reduction applies to a monocolored hybrid pip
 * only if it's paid generically (the Spectral Procession ruling). Any other
 * excess is lost — a cost can't go below nothing.
 */
export function reduceManaCost(
  cost: ManaCost,
  reduceGeneric: number,
  colored: readonly ColoredReduction[] = [],
): ManaCost {
  const nextColored = { ...cost.colored };
  const hybrid: HybridPip[] = [...cost.hybrid];
  let generic = cost.generic;
  let reduction = Math.max(0, reduceGeneric);
  for (const { colors, coloredOnly } of colored) {
    for (const color of COLORS) {
      let left = colors[color];
      const take = Math.min(left, nextColored[color]);
      nextColored[color] -= take;
      left -= take;
      while (left > 0) {
        const hasColor = (pip: HybridPip) =>
          pip.some((o) => o.kind === "color" && o.color === color);
        let index = hybrid.findIndex((pip) => hasColor(pip) && pip.some((o) => o.kind === "generic"));
        if (index < 0) index = hybrid.findIndex(hasColor);
        if (index < 0) break;
        hybrid.splice(index, 1);
        left -= 1;
      }
      if (left > 0 && !coloredOnly) reduction += left;
    }
  }
  generic -= reduction;
  let twobridReduction = cost.twobridReduction ?? 0;
  if (generic < 0) {
    const twobridGeneric = hybrid.reduce(
      (sum, pip) => sum + Math.max(0, ...pip.map((o) => (o.kind === "generic" ? o.amount : 0))),
      0,
    );
    twobridReduction = Math.min(twobridGeneric, twobridReduction - generic);
    generic = 0;
  }
  return {
    generic,
    colored: nextColored,
    colorless: cost.colorless,
    snow: cost.snow,
    x: cost.x,
    hybrid,
    ...(twobridReduction > 0 ? { twobridReduction } : {}),
  };
}

/**
 * A cost reduction by the mana symbols of a mana cost (rule 702.48c, offering's
 * "reduced by the sacrificed permanent's mana cost"), each hybrid pip's half
 * chosen: `text` the symbols it takes off, `""` for none.
 */
export interface ManaCostReduction {
  readonly generic: number;
  readonly colors: Readonly<Record<Color, number>>;
  readonly colorless: number;
  readonly text: string;
}

/** `cost` less a {@link ManaCostReduction}: its coloured and colorless symbols
 * first take mana of their type, any excess then generic (rules 118.7b-d). */
export function reducedBy(cost: ManaCost, by: ManaCostReduction): ManaCost {
  const colorless = Math.min(cost.colorless, by.colorless);
  return reduceManaCost(
    { ...cost, colorless: cost.colorless - colorless },
    by.generic + by.colorless - colorless,
    [{ colors: by.colors, coloredOnly: false }],
  );
}

/**
 * The reductions the mana cost `symbols` could make to `spell`, one per way of
 * choosing its hybrid pips' halves that's worth choosing (rule 118.7e): a way
 * leaving the same cost as another, or one whatever pays another would pay, is
 * dropped. The choice left is twobrid's: {2/R} against a {R} of the spell's is
 * {2} less, or the {R}. A Phyrexian pip is its colour (118.7f), a snow pip
 * generic (118.7g), and an {X} 0 (202.3e). No mana cost is one reduction of
 * nothing.
 */
export function manaCostReductions(symbols: string | null, spell: ManaCost): readonly ManaCostReduction[] {
  const cost = parseManaCost(symbols);
  type Half = { readonly color: Color } | { readonly generic: number };
  const ways = cost.hybrid.reduce<(readonly Half[])[]>(
    (sofar, pip) =>
      sofar.flatMap((way) =>
        pip.flatMap((option): (readonly Half[])[] =>
          option.kind === "color"
            ? [[...way, { color: option.color }]]
            : option.kind === "generic"
              ? [[...way, { generic: option.amount }]]
              : [],
        ),
      ),
    [[]],
  );
  const reductions = ways.map((way): ManaCostReduction => {
    const colors = { ...cost.colored };
    let generic = cost.generic + cost.snow;
    for (const half of way) {
      if ("color" in half) colors[half.color] += 1;
      else generic += half.generic;
    }
    const text = [
      generic > 0 ? `{${generic}}` : "",
      "{C}".repeat(cost.colorless),
      ...COLORS.map((color) => `{${color}}`.repeat(colors[color])),
    ].join("");
    return { generic, colors, colorless: cost.colorless, text };
  });
  const left = reductions.map((reduction) => reducedBy(spell, reduction));
  /** Whatever pays `a` pays `b`: `b` asks no more of any type, nor more mana. */
  const paysFor = (a: ManaCost, b: ManaCost): boolean =>
    a.colorless >= b.colorless &&
    COLORS.every((color) => a.colored[color] >= b.colored[color]) &&
    cheapestManaAmount(a) >= cheapestManaAmount(b) &&
    JSON.stringify(a.hybrid) === JSON.stringify(b.hybrid) &&
    (a.twobridReduction ?? 0) <= (b.twobridReduction ?? 0);
  return reductions.filter(
    (_reduction, i) =>
      !left.some((other, j) => j !== i && paysFor(left[i], other) && (!paysFor(other, left[i]) || j < i)),
  );
}

/** The least mana `cost` could be paid with, each hybrid pip at its cheapest
 * half — for comparing two versions of one cost, not for paying either. */
export function cheapestManaAmount(cost: ManaCost): number {
  return (
    COLORS.reduce((sum, color) => sum + cost.colored[color], cost.generic) +
    cost.colorless +
    cost.snow +
    cost.hybrid.reduce(
      (sum, pip) =>
        sum + Math.min(...pip.map((option) => (option.kind === "generic" ? option.amount : 1))),
      0,
    )
  );
}
