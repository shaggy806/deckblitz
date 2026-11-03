// Turns a card face's Oracle text into card-definition data, as far as plain
// pattern matching safely can. Used by `card-scaffold.mjs`.
//
// Two tiers:
//   1. Structure — every activated ability's cost and restrictions, every
//      loyalty ability's cost, every triggered ability's trigger, the targets
//      its effect names, keyword lines, partner abilities, ward, equip, enchant,
//      cycling and flashback lines, and a handful of static lines.
//   2. Effects — whole sentences matched against a fixed set of templates
//      ("Draw a card.", "~ deals 3 damage to any target.", "Add {G} or {U}.").
//      A template matches the whole sentence or not at all, so nothing is ever
//      half-read: a sentence no template covers stays a TODO for a person.
//
// Everything returned is plain data in the engine's own shapes, so a test can
// hand it to `defineCard` and play it. An ability whose effect didn't fully
// parse keeps `effect: null` and carries `__todo` (the sentences left to
// author) and `__hint` (what the sentences that *did* parse became) — the
// serializer below prints both as comments.
//
// Pure: no I/O. `parseFace(face, ctx)`, where `ctx.tokenFor(description)`
// names the engine token a "create …" clause means (or `null`). A keyword the
// engine has a helper for (crew, undying, unearth, …) is that helper's own
// output, read from the built engine, so it's exactly what a hand-authored
// card gets.

import {
  affinity,
  afflict,
  afterlife,
  bushido,
  soulshift,
  rampage,
  renown,
  cumulativeUpkeep,
  echo,
  recover,
  ripple,
  annihilator,
  awaken,
  levelBand,
  levelStatic,
  levelUp,
  mentor,
  crew,
  dethrone,
  enlist,
  evolve,
  extort,
  increment,
  flanking,
  godDevotion,
  livingWeapon,
  mobilize,
  myriad,
  outlast,
  persist,
  saddle,
  champion,
  kinship,
  prowl,
  provoke,
  soulbond,
  spectacle,
  sunburst,
  searchZonesAndOr,
  surge,
  undying,
  unearth,
  vanishing,
} from "../dist/cards/helpers.js";

// ------------------------------------------------------------------ text

const NUMBERS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
/** `effects.ts`'s `CHOSEN_CARD_NAME`: "a card with the chosen name". */
export const CHOSEN_CARD_NAME = "$chosenName";
/** `effects.ts`'s `choose-value` placeholders: the colour, card type and
 * kind of counter chosen as the effect resolves. */
export const CHOSEN_COLOR = "$chosenColor";
export const CHOSEN_CARD_TYPE = "$chosenCardType";
export const CHOSEN_COUNTER = "$chosenCounter";
const CHOSEN_CONSTANTS = {
  [CHOSEN_CARD_NAME]: "CHOSEN_CARD_NAME",
  [CHOSEN_COLOR]: "CHOSEN_COLOR",
  [CHOSEN_CARD_TYPE]: "CHOSEN_CARD_TYPE",
  [CHOSEN_COUNTER]: "CHOSEN_COUNTER",
};
const N ="(a|an|one|two|three|four|five|six|seven|eight|nine|ten|x|\\d+)";
const numberOf = (word) => {
  const w = word.toLowerCase();
  if (w === "x") return "x";
  if (/^\d+$/.test(w)) return Number(w);
  return NUMBERS[w];
};

export const stripReminder = (line) => line.replace(/\s*\([^)]*\)/g, "").trim();

/** The line as the templates read it: reminder text gone, the card's own name
 * (and its short name, "Kibo" for "Kibo, Uktabi Prince" and "Medomai" for
 * "Medomai the Ageless") and "this creature" / "this artifact" / … all written
 * "~". */
export function normalize(line, faceName) {
  let s = stripReminder(line);
  // A meld card's combined back face is another card's name, though it may
  // begin with this one's short name ("meld them into Urza, Planeswalker"):
  // kept whole.
  const meldInto = /meld them into (.+)\.$/.exec(s)?.[1];
  if (meldInto !== undefined) s = s.replace(`meld them into ${meldInto}.`, "meld them into \u0001.");
  s = s.split(faceName).join("~");
  const short = /^([A-Z][\w'-]+) the [A-Z]/.exec(faceName)?.[1] ?? faceName.split(",")[0];
  if (short !== faceName && short.length >= 3) s = s.replace(new RegExp(`\\b${escapeRe(short)}\\b`, "g"), "~");
  s = s.replace(/\bthis (creature|artifact|enchantment|land|permanent|Equipment|Vehicle|Aura|token|spell|card|Saga)\b/gi, "~");
  if (meldInto !== undefined) s = s.replace("\u0001", meldInto);
  return s.trim();
}
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Dash labels that aren't ability or flavor words (rule 207.2c-d): each one
 * changes how its line works, and the parser models none of them. Power-up is
 * once only and cheaper the turn it entered, Max speed and a Case's Solved
 * grant their line conditionally, and the others are Sagas, Attractions and
 * companions. (Exhaust and Boast are read, as activated-ability flags, and
 * Forecast as an ability of the card in the hand.) */
const KINSHIP =
  /^Kinship — At the beginning of your upkeep, you may look at the top card of your library\. If it shares a creature type with ~, you may reveal it\. If you do, (.+\.)$/;

const MEANINGFUL_LABEL = /^(Power-up|Max speed|Solved|To solve|Companion|Visit|[IVX]+(?:, [IVX]+)*) — /;

/** A companion's condition (rule 702.139, `companion.ts`), or `null` for a
 * wording no template reads. */
function companionCondition(text) {
  const scope = "(permanent|creature|nonland)";
  const deck = "in your starting deck";
  let m;
  if ((m = /^Your starting deck contains only cards with (even|odd) mana values( and land cards)?\.$/.exec(text))) {
    return { kind: "each-card", of: m[2] ? "nonland" : "card", test: { manaValueIs: m[1] } };
  }
  if ((m = /^Your starting deck contains only cards with mana value (\d+) or greater( and land cards)?\.$/.exec(text))) {
    return { kind: "each-card", of: m[2] ? "nonland" : "card", test: { manaValueAtLeast: Number(m[1]) } };
  }
  if ((m = new RegExp(`^Each ${scope} card ${deck} has mana value (\\d+) or less\\.$`).exec(text))) {
    return { kind: "each-card", of: m[1], test: { manaValueAtMost: Number(m[2]) } };
  }
  if ((m = new RegExp(`^Each ${scope} card ${deck} has an activated ability\\.$`).exec(text))) {
    return { kind: "each-card", of: m[1], test: { hasActivatedAbility: true } };
  }
  if ((m = new RegExp(`^Each ${scope} card ${deck} is an? (.+) card\\.$`).exec(text))) {
    return { kind: "each-card", of: m[1], test: { subtypeAmong: m[2].split(/, (?:or )?| or /) } };
  }
  if ((m = new RegExp(`^Each ${scope} card ${deck} has a different name\\.$`).exec(text))) {
    return { kind: "different-names", of: m[1] };
  }
  if ((m = new RegExp(`^Each ${scope} card ${deck} shares a card type\\.$`).exec(text))) {
    return { kind: "shared-card-type", of: m[1] };
  }
  if (text === `No card ${deck} has more than one of the same mana symbol in its mana cost.`) {
    return { kind: "each-card", of: "card", test: { noRepeatedManaSymbol: true } };
  }
  if (text === "Your starting deck contains at least twenty cards more than the minimum deck size.") {
    return { kind: "deck-size-over-minimum", atLeast: 20 };
  }
  return null;
}

/** "A deck can have up to seven cards named ~" (Seven Dwarves, Nazgûl). */
const DECK_COPY_WORDS = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

/** "Add {G}. Draw a card." → its sentences, each ending in its period. A
 * quoted ability ("…with \"Whenever …, draw a card.\"") is part of the
 * sentence around it, never a sentence of its own. */
function sentencesOf(text) {
  const out = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    current += ch;
    if (ch === '"' || ch === "“" || ch === "”") quoted = !quoted;
    const next = text.slice(i + 1);
    if (!quoted && (ch === "." || (ch === '"' && current.endsWith('."'))) && /^\s+[A-Z~•]/.test(next)) {
      out.push(current.trim());
      current = "";
    }
  }
  if (current.trim() !== "") out.push(current.trim());
  return out;
}

// -------------------------------------------------------------- keywords

export const KEYWORDS = {
  flying: "flying", reach: "reach", haste: "haste", vigilance: "vigilance", defender: "defender",
  "first strike": "first-strike", "double strike": "double-strike", trample: "trample",
  deathtouch: "deathtouch", lifelink: "lifelink", menace: "menace", indestructible: "indestructible",
  hexproof: "hexproof", shroud: "shroud", flash: "flash", fear: "fear", intimidate: "intimidate", skulk: "skulk", riot: "riot", unleash: "unleash", storied: "storied", ascend: "ascend",
  "start your engines!": "start-your-engines",
  infect: "infect", wither: "wither", "umbra armor": "umbra-armor", "totem armor": "umbra-armor",
  plainswalk: "plainswalk", islandwalk: "islandwalk", swampwalk: "swampwalk",
  mountainwalk: "mountainwalk", forestwalk: "forestwalk", desertwalk: "desertwalk",
  changeling: "changeling", daybound: "daybound", nightbound: "nightbound", shadow: "shadow",
  horsemanship: "horsemanship", banding: "banding",
};

const COST = "((?:\\{[^}]+\\})+)";

/** "a blue card", "two red cards" — a pitch cost's exile from the hand
 * (`alternativeCost.exileFromHand`, an evoke's). */
function pitchExile(what) {
  const [, n, color] = /^(an?|two|three) (white|blue|black|red|green) cards?$/.exec(what);
  const count = { two: 2, three: 3 }[n];
  const code = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[color];
  return { filter: { colors: [code] }, ...(count !== undefined ? { count } : {}), text: what };
}
/**
 * A keyword the engine runs as an ability or a card field rather than a
 * `Keyword` — what it adds to the face, or `null`. Each shape is the one the
 * pool's own cards use (the helper, or the card field).
 */
function keywordPart(part, faceName, typeLine = "") {
  const p = part.trim();
  let m;
  // Sunburst (rule 702.44a): +1/+1 counters on a creature, charge counters
  // otherwise — the helper's reminder names which.
  if (/^sunburst$/i.test(p)) return { static: [sunburst(/\bCreature\b/.test(typeLine) ? "creature" : "artifact")] };
  if ((m = /^crew (\d+)$/i.exec(p))) return { activated: [crew(Number(m[1]))] };
  // Saddle N (rule 702.171a): crew's cost at sorcery speed, the Mount saddled.
  if ((m = /^saddle (\d+)$/i.exec(p))) return { activated: [saddle(Number(m[1]))] };
  // Enlist (rule 702.154a): an optional cost to attack, its pump the engine's.
  if (/^enlist$/i.test(p)) return { static: [enlist()] };
  if ((m = /^afflict (\d+)$/i.exec(p))) return { triggered: [afflict(Number(m[1]))] };
  // Bushido N (rule 702.45a): its blocks and becomes-blocked triggers.
  if ((m = /^bushido (\d+)$/i.exec(p))) return { triggered: bushido(Number(m[1])) };
  // Soulshift N (rule 702.46a): its dies trigger, a Spirit card back to hand.
  if ((m = /^soulshift (\d+)$/i.exec(p))) return { triggered: [soulshift(Number(m[1]))] };
  // Afterlife N (rule 702.135a): its dies trigger.
  if ((m = /^afterlife (\d+)$/i.exec(p))) return { triggered: [afterlife(Number(m[1]))] };
  // Cumulative upkeep [cost] (rule 702.24a): its upkeep trigger, the cost
  // paid once per age counter.
  if ((m = new RegExp(`^cumulative upkeep ${COST}$`, "i").exec(p))) return { triggered: [cumulativeUpkeep(m[1])] };
  if ((m = /^cumulative upkeep—pay (\d+) life\.?$/i.exec(p))) return { triggered: [cumulativeUpkeep({ life: Number(m[1]) })] };
  if (/^cumulative upkeep—sacrifice a land\.?$/i.test(p)) {
    return { triggered: [cumulativeUpkeep({ sacrifice: { type: "land" }, text: "Sacrifice a land" })] };
  }
  // Echo [cost] (rule 702.30a): its upkeep trigger, "if this came under your
  // control since the beginning of your last upkeep".
  if ((m = new RegExp(`^echo ${COST}$`, "i").exec(p))) return { triggered: [echo(m[1])] };
  if (/^echo—discard a card\.?$/i.test(p)) return { triggered: [echo({ discard: 1, text: "Discard a card" })] };
  if (/^echo—sacrifice two lands\.?$/i.test(p)) {
    return { triggered: [echo({ sacrifice: { type: "land" }, count: 2, text: "Sacrifice two lands" })] };
  }
  // Recover [cost] (rule 702.59a): its trigger from the graveyard.
  if ((m = new RegExp(`^recover ${COST}$`, "i").exec(p))) return { triggered: [recover(m[1])] };
  // Ripple N (rule 702.60a): its cast trigger, the name the card's own.
  if ((m = /^ripple (\d+)$/i.exec(p)) && faceName !== undefined) return { triggered: [ripple(Number(m[1]), faceName)] };
  // Rampage N (rule 702.23a): its becomes-blocked trigger.
  if ((m = /^rampage (\d+)$/i.exec(p))) return { triggered: [rampage(Number(m[1]))] };
  // Renown N (rule 702.112a): its combat-damage trigger, "if it isn't renowned".
  if ((m = /^renown (\d+)$/i.exec(p))) return { triggered: [renown(Number(m[1]))] };
  // Spectacle [cost] (rule 702.137a): an alternative cost.
  if ((m = new RegExp(`^spectacle ${COST}$`, "i").exec(p))) return { card: { alternativeCost: spectacle(m[1]) } };
  // Surge [cost] (rule 702.117a): an alternative cost.
  if ((m = new RegExp(`^surge ${COST}$`, "i").exec(p))) return { card: { alternativeCost: surge(m[1]) } };
  // Champion a [type] (rule 702.72a): its two linked triggers.
  if ((m = /^champion (an? )(creature|[a-z]+)$/i.exec(p))) {
    const what = m[2].toLowerCase() === "creature" ? { type: "creature" } : { subtype: m[2][0].toUpperCase() + m[2].slice(1) };
    return { triggered: champion(what, `${m[1]}${m[2]}`.trim()) };
  }
  // Prowl [cost] (rule 702.76a): an alternative cost.
  if ((m = new RegExp(`^prowl ${COST}$`, "i").exec(p))) return { card: { alternativeCost: prowl(m[1]) } };
  // Awaken N—[cost] (rule 702.113a): an alternative cost adding a target and
  // an effect — `awaken()` over the spell's own targets and effect, once
  // they're read (`parseFace`).
  if ((m = new RegExp(`^awaken (\\d+)—${COST}$`, "i").exec(p))) return { card: { awakenKeyword: { n: Number(m[1]), cost: m[2] } } };
  if ((m = /^annihilator (\d+)$/i.exec(p))) return { triggered: [annihilator(Number(m[1]))] };
  // Level up [cost] (rule 702.87a): its sorcery-speed level counter.
  if ((m = new RegExp(`^level up ${COST}$`, "i").exec(p))) return { activated: [levelUp(m[1])] };
  if ((m = /^mobilize (\d+)$/i.exec(p))) return { triggered: [mobilize(Number(m[1]))] };
  if ((m = new RegExp(`^outlast ${COST}$`, "i").exec(p))) return { activated: [outlast(m[1])] };
  if ((m = new RegExp(`^unearth ${COST}$`, "i").exec(p))) return { activated: [unearth(m[1])] };
  if ((m = /^fabricate (\d+)$/i.exec(p))) {
    // Angel of Invention's shape: the counters or that many Servos, chosen as it resolves.
    const n = Number(m[1]);
    return {
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          // Only while it's still on the battlefield is there a choice: gone,
          // the counters can't go on it, so the Servos (rule 702.123a's ruling).
          effect: {
            kind: "conditional",
            condition: { kind: "source-on-battlefield" },
            then: {
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                {
                  text: `Put ${n} +1/+1 counter${n === 1 ? "" : "s"} on this creature.`,
                  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: n },
                },
                {
                  text: `Create ${n} 1/1 colorless Servo artifact creature token${n === 1 ? "" : "s"}.`,
                  effect: { kind: "create-token", token: "Servo Token", count: n },
                },
              ],
            },
            else: { kind: "create-token", token: "Servo Token", count: n },
          },
          resolve: null,
          text: `Fabricate ${n}`,
        },
      ],
    };
  }
  if ((m = /^modular(?: (\d+)|—sunburst)$/i.exec(p))) {
    // Arcbound Ravager's shape: enters with the counters; may move them as it
    // dies. "Modular—Sunburst" is a +1/+1 counter per colour spent to cast it,
    // creature or not (rule 702.44c).
    const n = m[1] !== undefined ? Number(m[1]) : { colorsSpentOf: "source" };
    const label = typeof n === "number" ? `Modular ${n}` : "Modular—Sunburst";
    return {
      static: [
        {
          affects: { scope: "self" },
          replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: n } },
          text: label,
        },
      ],
      triggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
          effect: {
            kind: "may",
            prompt: "Put this creature's +1/+1 counters on target artifact creature?",
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { countersOn: "source", counter: "+1/+1" } },
          },
          resolve: null,
          text: label,
        },
      ],
    };
  }
  if ((m = /^graft (\d+)$/i.exec(p))) {
    // Graft N (rule 702.58a): enters with the counters; whenever another
    // creature enters, if this has a +1/+1 counter (an intervening if,
    // 603.4), may move one onto it (a move, 122.5).
    const n = Number(m[1]);
    return {
      static: [
        {
          affects: { scope: "self" },
          replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: n } },
          text: `Graft ${n}`,
        },
      ],
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
          condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Move a +1/+1 counter from ~ onto the creature that entered?",
            effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
          },
          resolve: null,
          text: `Graft ${n}`,
        },
      ],
    };
  }
  const simple = {
    undying: () => ({ triggered: [undying()] }),
    persist: () => ({ triggered: [persist()] }),
    mentor: () => ({ triggered: [mentor()] }),
    flanking: () => ({ keywords: ["flanking"], triggered: [flanking()] }),
    // Provoke (rule 702.39a): the attack trigger's untap and block-if-able.
    provoke: () => ({ triggered: [provoke("Provoke")] }),
    dethrone: () => ({ triggered: [dethrone()] }),
    myriad: () => ({ triggered: [myriad()] }),
    extort: () => ({ triggered: [extort()] }),
    evolve: () => ({ triggered: [evolve()] }),
    soulbond: () => ({ triggered: soulbond() }),
    increment: () => ({ triggered: [increment()] }),
    "living weapon": () => ({ triggered: [livingWeapon()] }),
    // For Mirrodin! (rule 702.163a): a 2/2 red Rebel, then this attaches to it
    // (Hexplate Wallbreaker's shape).
    "for mirrodin!": () => ({
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "create-token", token: "Rebel Token", count: 1 },
              { kind: "attach", target: "created", attachment: "source" },
            ],
          },
          resolve: null,
          text: "For Mirrodin!",
        },
      ],
    }),
    // Training (rule 702.149a) — the `training()` helper's ability.
    training: () => ({
      triggered: [
        {
          trigger: { on: "attacks", who: "self", withGreaterPower: true },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
          resolve: null,
          text: "Training",
        },
      ],
    }),
    // Exploit (rule 702.110a) — the `exploit()` helper's ability.
    exploit: () => ({
      triggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Exploit: sacrifice a creature?",
            effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exploit: true },
          },
          resolve: null,
          text: "Exploit",
        },
      ],
    }),
    exalted: () => ({
      triggered: [
        {
          trigger: { on: "attacks-alone", who: "you-control" },
          targets: [],
          effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: "Exalted",
        },
      ],
    }),
    "battle cry": () => ({
      triggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "modify-pt-all",
            filter: { type: "creature", attacking: true },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
            exceptSource: true,
          },
          resolve: null,
          text: "Battle cry",
        },
      ],
    }),
    storm: () => ({ triggered: [{ trigger: { on: "this-cast" }, targets: [], effect: { kind: "storm" }, resolve: null, text: "Storm" }] }),
    // Gravestorm (rule 702.69a): the `gravestorm()` helper.
    gravestorm: () => ({
      triggered: [
        {
          trigger: { on: "this-cast" },
          targets: [],
          effect: {
            kind: "copy-spell",
            target: "trigger-spell",
            newTargets: true,
            count: { turnHistory: "to-graveyard", who: "each-player", from: ["battlefield"] },
          },
          resolve: null,
          text: "Gravestorm",
        },
      ],
    }),
    cascade: () => ({
      triggered: [{ trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" }],
    }),
    convoke: () => ({ card: { convoke: true } }),
    // Assist (rule 702.132a): another player may pay generic mana of its cost.
    assist: () => ({ card: { assist: true } }),
    // Improvise (rule 702.126a): convoke's machinery, artifacts paying generic mana.
    improvise: () => ({ card: { improvise: true } }),
    // Undaunted (rule 702.125a): {1} less for each opponent, the always-true
    // gate the party and domain reductions use.
    undaunted: () => ({
      card: { selfCostReduction: { condition: { kind: "controls", filter: {}, atLeast: 0 }, reduceGeneric: { opponents: true } } },
    }),
    // Compleated (rule 702.150a): the loyalty it enters with.
    compleated: () => ({ card: { compleated: true } }),
    // Read ahead (rule 702.155): its chapter choice comes from `defineCard`.
    "read ahead": () => ({ card: { readAhead: true } }),
    // Devoid makes the card colourless (rule 702.114a), which its colours
    // already say.
    devoid: () => ({}),
    "affinity for artifacts": () => ({ card: { selfCostReduction: affinity({ type: "artifact" }) } }),
  }[p.toLowerCase()];
  if (simple !== undefined) return simple();
  if ((m = new RegExp(`^(morph|megamorph) ${COST}$`, "i").exec(p))) {
    return { card: { morph: { keyword: m[1].toLowerCase(), cost: m[2] } } };
  }
  // A morph cost that isn't mana ("Morph—Pay 5 life", "Morph—Sacrifice two
  // Mountains"): `morph.also`, paid as it's turned face up.
  if ((m = /^(morph|megamorph)—(.+?)\.?$/i.exec(p))) {
    const also = morphNonManaCost(m[2]);
    if (also === null) return null;
    return { card: { morph: { keyword: m[1].toLowerCase(), cost: "", also, text: m[2] } } };
  }
  if ((m = new RegExp(`^disturb ${COST}$`, "i").exec(p))) return { card: { disturb: { cost: m[1] } } };
  // Toxic N (rule 702.164a): the card's own `toxic` field.
  if ((m = /^toxic (\d+)$/i.exec(p))) return { card: { toxic: Number(m[1]) } };
  // Vanishing N (rule 702.63a): the helper's three abilities.
  if ((m = /^vanishing (\d+)$/i.exec(p))) {
    const v = vanishing(Number(m[1]));
    return { static: [...v.static], triggered: [...v.triggered] };
  }
  if ((m = new RegExp(`^suspend (\\d+)—${COST}$`, "i").exec(p))) return { card: { suspend: { n: Number(m[1]), cost: m[2] } } };
  // Suspend X (every one of them says X can't be 0).
  if ((m = new RegExp(`^suspend x—${COST}\\. x can't be 0\\.?$`, "i").exec(p))) return { card: { suspend: { n: "x", cost: m[1] } } };
  // Tribute N (rule 702.104a): the opponent's counters, asked as it enters.
  if ((m = /^tribute (\d+)$/i.exec(p))) return { card: { tribute: Number(m[1]) } };
  // Amplify N (rule 702.38a): the cards revealed as it enters.
  if ((m = /^amplify (\d+)$/i.exec(p))) return { card: { amplify: Number(m[1]) } };
  // Devour N, devour land N, devour Food N (rule 702.82): what may be eaten.
  if ((m = /^devour (?:(land|food) )?(\d+)$/i.exec(p))) {
    const quality = m[1]?.toLowerCase();
    const filter =
      quality === "land" ? { type: "land" } : quality === "food" ? { type: "artifact", subtype: "Food" } : { type: "creature" };
    return { card: { devour: { multiplier: Number(m[2]), filter } } };
  }
  // Landcycling and typecycling: cycling that searches (Ash Barrens, Eagles of the North).
  if ((m = new RegExp(`^basic landcycling ${COST}$`, "i").exec(p))) {
    return { card: { cycling: { cost: m[1], search: { supertype: "basic", type: "land" } } } };
  }
  if ((m = new RegExp(`^(plains|island|swamp|mountain|forest|desert)cycling ${COST}$`, "i").exec(p))) {
    const type = m[1][0].toUpperCase() + m[1].slice(1).toLowerCase();
    return { card: { cycling: { cost: m[2], search: { subtype: type } } } };
  }
  return null;
}

/** Prowess (rule 702.108) is a triggered ability, not a `Keyword`: the shape
 * every pool card authors it in. */
const prowessAbility = () => ({
  trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
  targets: [],
  effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
});

const COLOR_WORD = { white: "W", blue: "U", black: "B", red: "R", green: "G" };
/** "Protection from red", "protection from white and from blue",
 * "protection from multicolored" — a static, or `null` for any other part. */
const protectionOf = (part) => {
  const text = part.charAt(0).toUpperCase() + part.slice(1);
  const self = (protection) => ({ affects: { scope: "self" }, protection, text });
  // A quality that isn't a word (rules 702.16j, k): everything, players, spells.
  if (/^protection from everything$/i.test(part)) return self({ filter: {} });
  if (/^protection from each of your opponents$/i.test(part)) return self({ fromPlayers: "opponents" });
  if (/^protection from spells that are one or more colors$/i.test(part)) return self({ filter: { isSpell: true, colorless: false } });
  if (/^protection from spells and from permanents that were cast this turn$/i.test(part)) {
    return self({ filter: { anyOf: [{ isSpell: true }, { isSpell: false, cast: true, enteredThisTurn: true }] } });
  }
  const m = /^protection from (\w+)(?: and from (\w+))?$/i.exec(part);
  if (m === null) return null;
  const printedWords = [m[1], m[2]].filter(Boolean);
  const words = printedWords.map((w) => w.toLowerCase());
  if (words.length === 1 && words[0] === "multicolored") return self({ filter: { multicolored: true } });
  if (words.every((w) => COLOR_WORD[w] !== undefined)) return self({ colors: words.map((w) => COLOR_WORD[w]) });
  // A subtype, always capitalised in Oracle text: "Protection from Demons and
  // from Dragons" (rule 702.16a).
  if (printedWords.every((w) => /^[A-Z]/.test(w) && singular(w) !== w.toLowerCase())) {
    const each = printedWords.map((w) => ({ subtype: singular(w) }));
    return self({ filter: each.length === 1 ? each[0] : { anyOf: each } });
  }
  return null;
};
const KW = `(${Object.keys(KEYWORDS).join("|")})`;

// ------------------------------------------------------------ type words

const CARD_TYPES = ["creature", "artifact", "enchantment", "land", "planeswalker", "instant", "sorcery", "battle"];
/** Creature types whose plural isn't just "-s". */
const IRREGULAR = { Elves: "Elf", Dwarves: "Dwarf", Wolves: "Wolf", Werewolves: "Werewolf", Faeries: "Faerie", Mice: "Mouse", Fungi: "Fungus", Allies: "Ally", Sphinxes: "Sphinx", Foxes: "Fox", Octopi: "Octopus", Djinn: "Djinn", Mercenaries: "Mercenary", Zombies: "Zombie" };
/** Subtypes that end in "s" in the singular: the land type Plains and the
 * creature types that do (the engine's CREATURE_TYPES), which the plural
 * rule below would otherwise clip ("Plains" → "Plain"). */
const SINGULAR_WITH_S = new Set([
  "Plains", "Astartes", "Aurochs", "Custodes", "Cyclops", "Fungus", "Homunculus", "Nautilus", "Octopus",
  "Pegasus", "Platypus", "Thalakos", "Walrus",
]);
const singular = (w) => {
  const lower = w.toLowerCase();
  if (CARD_TYPES.includes(lower.replace(/s$/, ""))) return lower.replace(/s$/, "");
  if (SINGULAR_WITH_S.has(w)) return w;
  if (IRREGULAR[w] !== undefined) return IRREGULAR[w];
  // A capitalised plural subtype: "Goblins", "Slivers".
  if (/^[A-Z][a-z]+s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
  return w;
};

/**
 * A type phrase — "creature", "nontoken creature", "artifact or enchantment",
 * "Elf", "Zombie creature", "noncreature artifact", "creature token" — as a
 * `CardFilter`. `null` for anything with a word it doesn't know.
 */
/** Craft's materials (rule 702.167a) — "artifact", "one or more Dinosaurs",
 * "two creatures", "two that share a card type", a bare "one or more" — as
 * `AbilityCost.craft`; anything else (a list of kinds, "… cards") is a
 * person's. A type without "card" is a permanent or a graveyard card
 * (702.167b), which is what the engine offers. */
export function craftMaterials(phrase) {
  const COUNTS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  if (phrase === "one or more") return { count: 1, orMore: true, text: phrase };
  if (phrase === "two that share a card type") return { count: 2, share: "card-type", text: phrase };
  let m = /^one or more (.+)$/.exec(phrase);
  let count = 1;
  let rest = phrase;
  if (m) rest = m[1];
  else if ((m = /^(a|an|two|three|four|five|six) (.+)$/.exec(phrase))) {
    count = COUNTS[m[1]];
    rest = m[2];
  }
  if (/\bcards?\b|,| and /.test(rest)) return null;
  const filter = parseTypePhrase(rest);
  if (filter === null || Object.keys(filter).length === 0) return null;
  return { count, ...(phrase.startsWith("one or more") ? { orMore: true } : {}), filter, text: phrase };
}

/**
 * The spells a flash permission names, between "cast" and "spells": nothing
 * (every spell — `true`), a type phrase ("creature", "Sliver"), or two card
 * types joined by "and" ("creature and enchantment" — either type). `null`
 * for anything else.
 */
/** Granted cascade: a `this-cast` trigger, as the keyword's own. */
const CASCADE_TRIGGER = { trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" };

/** What "the next … spell you cast this turn" gets, by the phrase. */
function nextSpellGrant(phrase) {
  if (phrase === "has cascade") return { triggered: [CASCADE_TRIGGER] };
  if (phrase === "has convoke") return { convoke: true };
  return { cantBeCountered: true };
}

function flashSpellsFilter(words) {
  if (words === undefined || words === "") return true;
  const both = /^(\w+) and (\w+)$/.exec(words);
  if (both) return CARD_TYPES.includes(both[1]) && CARD_TYPES.includes(both[2]) ? { typesAnyOf: [both[1], both[2]] } : null;
  const filter = parseTypePhrase(words);
  return filter === null || Object.keys(filter).length === 0 ? null : filter;
}

export function parseTypePhrase(phrase, { cards = false } = {}) {
  const words = phrase.trim().split(/\s+/);
  const filter = {};
  const types = [];
  const notTypes = [];
  const anyOf = [];
  for (let i = 0; i < words.length; i += 1) {
    const raw = words[i];
    const w = singular(raw.replace(/,$/, ""));
    if (w === "or" || w === "and/or") {
      // "creature or planeswalker" is either type. "artifact creature or
      // Vehicle" is (artifact creature) or (Vehicle), which one filter can't
      // say, so only a lone type before the "or" is read.
      if (types.length !== 1 || filter.subtype !== undefined) return null;
      anyOf.push(types.pop());
      continue;
    }
    // Only another type can follow the "or": "creature or token" is a
    // creature or any token, not a creature token (Ice Cream Kitty).
    if (anyOf.length > 0 && !CARD_TYPES.includes(w)) return null;
    // On the battlefield everything is a permanent. Among cards (a graveyard,
    // a library) a "permanent card" is one that isn't an instant or sorcery.
    if (w === "permanent" || w === "permanents") {
      if (cards) notTypes.push("instant", "sorcery");
      continue;
    }
    if (w === "double-faced") filter.doubleFaced = true;
    else if (w === "nontoken") filter.token = false;
    else if (w === "token" || w === "tokens") filter.token = true;
    else if (w === "legendary") filter.supertype = "legendary";
    else if (w === "basic") filter.supertype = "basic";
    else if (w === "nonland" || w === "noncreature" || w === "nonartifact" || w === "nonenchantment") {
      notTypes.push(w.slice(3));
    } else if (CARD_TYPES.includes(w)) {
      if (anyOf.length > 0) anyOf.push(w);
      else types.push(w);
    } else if (/^[A-Z][a-z]+$/.test(w) && !["You", "Your"].includes(w)) {
      // A subtype, singular as printed after a quantity ("an Elf"). Not as
      // an alternative to a type ("creature or Vehicle").
      if (filter.subtype !== undefined || anyOf.length > 0) return null;
      filter.subtype = w;
    } else return null;
  }
  // Whether "nontoken" or "legendary" before an "or" reaches past it is the
  // card's to say, not the parser's.
  if (anyOf.length > 0 && (filter.token !== undefined || filter.supertype !== undefined || notTypes.length > 0)) {
    return null;
  }
  if (anyOf.length > 0) filter.typesAnyOf = anyOf;
  if (types.length === 1) filter.type = types[0];
  else if (types.length > 1) filter.types = types;
  if (notTypes.length > 0) filter.notTypes = notTypes;
  return filter;
}

/**
 * One set an aggregate reads ("creatures you control", "creature cards in
 * your graveyard", "Dragon cards in all graveyards", "instant and sorcery
 * cards you own in exile and in your graveyard") as `{ filter, in?,
 * excludeSelf? }`, or `null`. "other" leaves the source out (the
 * battlefield only).
 */
function aggregateSetOf(phrase) {
  let m;
  const typeOf = (words, cards) => {
    if (words === "") return {};
    if (words === "instant and sorcery") return { typesAnyOf: ["instant", "sorcery"] };
    const f = parseTypePhrase(words, { cards });
    return f;
  };
  if ((m = /^(other )?(.+?) you control$/.exec(phrase))) {
    const filter = typeOf(m[2], false);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { filter: { ...filter, controlledBy: "you" }, ...(m[1] ? { excludeSelf: true } : {}) };
  }
  if ((m = /^(?:(.+?) )?cards? you own in exile and in your graveyard$/.exec(phrase))) {
    const filter = typeOf(m[1] ?? "", true);
    if (filter === null) return null;
    return { filter: { ...filter, ownedBy: "you" }, in: ["graveyards", "exile"] };
  }
  if ((m = /^(?:(.+?) )?cards? in (your|all) graveyards?$/.exec(phrase))) {
    const filter = typeOf(m[1] ?? "", true);
    if (filter === null) return null;
    return { filter: m[2] === "your" ? { ...filter, ownedBy: "you" } : filter, in: "graveyards" };
  }
  return null;
}

/**
 * What a player controls in a combat restriction: "Island", "untapped land",
 * "creature with flying", "untapped creature with power 3 or greater" — a
 * filter, or `null`.
 */
function playerTestPermanent(phrase) {
  let rest = phrase;
  const extra = {};
  let m;
  if ((m = /^(.+) with (flying|reach|haste|defender|trample|vigilance|deathtouch|lifelink)$/.exec(rest))) {
    extra.keyword = m[2];
    rest = m[1];
  } else if ((m = /^(.+) with power (\d+) or (greater|less)$/.exec(rest))) {
    extra.power = { op: m[3] === "greater" ? "gte" : "lte", n: Number(m[2]) };
    rest = m[1];
  }
  let tapped;
  if ((m = /^(untapped|tapped) (.+)$/.exec(rest))) {
    tapped = m[1] === "tapped";
    rest = m[2];
  }
  const kind = parseTypePhrase(rest);
  if (kind === null || Object.keys(kind).length === 0) return null;
  return { ...kind, ...(tapped !== undefined ? { tapped } : {}), ...extra };
}

/**
 * The permanents of an "each … deals damage" (`each-deals-damage`): "creature",
 * "tapped creature", "other Bird you control", "modified creature you
 * control", "creature you control that's a Wolf or a Werewolf", "creature
 * with power 4 or greater you control", "creature you control with a +1/+1
 * counter on it" — as `{ filter, exceptSource? }`, or `null`. With `power`
 * (the damage is its power) a bare subtype is a creature's: a noncreature
 * permanent has no power to deal (rule 208.3).
 */
function dealersOf(phrase, power) {
  let rest = phrase;
  const filter = {};
  let exceptSource = false;
  let m;
  if ((m = /^other (.+)$/.exec(rest))) {
    exceptSource = true;
    rest = m[1];
  }
  if ((m = /^(.+) you control that's an? ([A-Z][a-z]+) or an? ([A-Z][a-z]+)$/.exec(rest))) {
    filter.controlledBy = "you";
    filter.subtypes = [m[2], m[3]];
    rest = m[1];
  } else if ((m = /^(.+) you control with an? \+1\/\+1 counter on it$/.exec(rest))) {
    filter.controlledBy = "you";
    filter.counters = { kind: "+1/+1", compare: { op: "gte", n: 1 } };
    rest = m[1];
  } else if ((m = /^(.+) you control$/.exec(rest))) {
    filter.controlledBy = "you";
    rest = m[1];
  }
  if ((m = /^(.+) with power (\d+) or greater$/.exec(rest))) {
    filter.power = { op: "gte", n: Number(m[2]) };
    rest = m[1];
  }
  if ((m = /^(tapped|modified) (.+)$/.exec(rest))) {
    filter[m[1]] = true;
    rest = m[2];
  }
  const kind = parseTypePhrase(rest);
  if (kind === null || Object.keys(kind).length === 0) return null;
  if (kind.typesAnyOf !== undefined || kind.types !== undefined) return null;
  if (filter.subtypes !== undefined && kind.subtype !== undefined) return null;
  if (power && kind.type === undefined && kind.subtype !== undefined) kind.type = "creature";
  return { filter: { ...kind, ...filter }, ...(exceptSource ? { exceptSource: true } : {}) };
}

/**
 * "the greatest power among creatures you control and creature cards in your
 * graveyard", "the total mana value of instant and sorcery cards in your
 * graveyard", "the total number of instant and sorcery cards you own in exile
 * and in your graveyard", "the number of counters among creatures you
 * control" — an `AggregateSpec`, or `null`. Two sets joined by "and" after a
 * whole first set are a `plus`.
 */
export function aggregatePhraseOf(phrase) {
  let m;
  const STAT = { power: "power", toughness: "toughness", "mana value": "mana-value" };
  let head;
  let rest;
  if ((m = /^the greatest (power|toughness|mana value) among (.+)$/.exec(phrase))) {
    head = { aggregate: "max", of: STAT[m[1]] };
    rest = m[2];
  } else if ((m = /^the total (power|toughness|mana value) of (.+)$/.exec(phrase))) {
    head = { aggregate: "sum", of: STAT[m[1]] };
    rest = m[2];
  } else if ((m = /^the number of counters (?:on|among) (.+)$/.exec(phrase))) {
    head = { aggregate: "sum", of: "counters" };
    rest = m[1];
  } else if ((m = /^the total number of (.+)$/.exec(phrase))) {
    head = { aggregate: "count" };
    rest = m[1];
  } else return null;
  const whole = aggregateSetOf(rest);
  const pair = whole === null ? /^(.+? you control) and (.+)$/.exec(rest) : null;
  const first = whole ?? (pair === null ? null : aggregateSetOf(pair[1]));
  const second = pair === null ? undefined : aggregateSetOf(pair[2]);
  if (first === null || second === null || second?.excludeSelf === true) return null;
  // A count only of what no `countOf` reaches.
  if (head.aggregate === "count" && first.in === undefined) return null;
  const { filter, ...where } = first;
  return {
    ...head,
    filter,
    ...where,
    ...(second !== undefined ? { plus: [{ filter: second.filter, ...(second.in ? { in: second.in } : {}) }] } : {}),
  };
}

/**
 * The cards a filtered discard names — "nonland", "colorless nonland",
 * "multicolored", "Trap" — as a filter over cards in hand; `null` for a
 * phrase the type reader doesn't know, or one that names nothing.
 */
function discardFilterOf(phrase) {
  const m = /^(?:(colorless|multicolored)(?: |$))?(.*)$/.exec(phrase);
  if (m === null) return null;
  const filter = m[2] === "" ? {} : parseTypePhrase(m[2], { cards: true });
  if (filter === null) return null;
  if (m[1] !== undefined) filter[m[1]] = true;
  return Object.keys(filter).length === 0 ? null : filter;
}

/**
 * What "behold …" names (rule 701.4a) — "an Elf", "a Gamma creature",
 * "three Elementals" — as a `BeholdSpec`: its quality as a filter over a card
 * in hand or a permanent, and the phrase itself as its `text`. `null` for a
 * phrase the type reader doesn't know, or one that says whose ("you control"
 * is behold's own).
 */
export function beholdOf(phrase) {
  const m = /^(a|an|two|three|four|five) (.+)$/.exec(phrase);
  if (m === null) return null;
  const count = numberOf(m[1]);
  const filter = parseTypePhrase(m[2]);
  if (filter === null || Object.keys(filter).length === 0) return null;
  // Only a type or subtype is a quality the reminder text names.
  if (Object.keys(filter).some((k) => k !== "type" && k !== "subtype")) return null;
  return { filter, text: phrase, ...(count > 1 ? { count } : {}) };
}

/**
 * What "reveal … from your hand" names as a cost (rule 701.20a) — "a Kithkin
 * card", "a Dragon card", "X white cards", "two blue cards": its `count`
 * (`"x"` for X), its `filter` over cards in hand (a colour, a type or
 * subtype, or both), and `noun`, the phrase without its count ("white
 * cards"). `null` for a phrase the reader doesn't know.
 */
export function handRevealOf(phrase) {
  const m = /^(a|an|X|two|three|four|five) (?:(white|blue|black|red|green|colorless) )?(.*?)\s*cards?$/.exec(phrase);
  if (m === null) return null;
  const count = m[1] === "X" ? "x" : numberOf(m[1]);
  if (count === undefined) return null;
  const filter = m[3] === "" ? {} : parseTypePhrase(m[3], { cards: true });
  if (filter === null) return null;
  if (Object.keys(filter).some((k) => k !== "type" && k !== "subtype")) return null;
  if (m[2] === "colorless") filter.colorless = true;
  else if (m[2] !== undefined) filter.colors = [COLOR_WORDS[m[2]]];
  if (Object.keys(filter).length === 0) return null;
  return { count, filter, noun: phrase.slice(m[1].length + 1) };
}

/**
 * A sentence reading "the revealed card's mana value" or "… power", where
 * the cost revealed one card from the hand (`ctx.costRevealed`): the
 * `"revealed"` amount ref — Induce Despair's -X/-X, Charge of the
 * Forever-Beast's damage, Calamity of the Titans' exile, Titan's Presence's
 * conditional exile, Living Destiny's life. `undefined` for anything else.
 */
function revealedCardEffectOf(s, ctx) {
  const mv = { manaValueOf: "revealed" };
  const power = { powerOf: "revealed" };
  const slot = (phrase) => {
    const spec = targetOf(phrase);
    return spec === undefined ? undefined : ctx.target(spec);
  };
  let m;
  if (/^Target creature gets -X\/-X until end of turn, where X is the revealed card's mana value\.$/.test(s)) {
    const negated = { product: [mv, -1] };
    return { kind: "modify-pt", target: slot("target creature"), power: negated, toughness: negated, duration: "end-of-turn" };
  }
  if ((m = /^~ deals damage to (target [^.]+) equal to the revealed card's power\.$/.exec(s))) {
    const target = slot(m[1]);
    return target === undefined ? undefined : { kind: "damage", target, amount: power };
  }
  if (/^Exile each creature and planeswalker with mana value less than the revealed card's mana value\.$/.test(s)) {
    return {
      kind: "exile-all",
      filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lt", n: { amount: mv } } },
    };
  }
  if (/^Exile target creature if its power is less than or equal to the revealed card's power\.$/.test(s)) {
    const target = slot("target creature");
    return {
      kind: "conditional",
      condition: { kind: "target", index: target, filter: { power: { op: "lte", n: { amount: power } } } },
      then: { kind: "exile", target },
    };
  }
  if (/^You gain life equal to the revealed card's mana value\.$/.test(s)) return { kind: "gain-life", amount: mv };
  return undefined;
}

// --------------------------------------------------------------- targets

/** Target phrases, longest first, as the engine's target specs. */
/** "The creature with the greatest power", ties counted: among creatures on the
 * battlefield whoever controls them, or in a graveyard among that graveyard's. */
const GREATEST_POWER_HERE = { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } };

const TARGET_PHRASES = [
  ["target multicolored creature", { kind: "permanent", whose: "any", filter: { type: "creature", multicolored: true } }],
  // What it has dealt damage to this turn (`dealtDamageThisTurn`).
  ["target creature that dealt damage to you this turn", { kind: "permanent", whose: "any", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } }],
  ["target creature an opponent controls that dealt damage this turn", { kind: "permanent", whose: "opponent", filter: { type: "creature", dealtDamageThisTurn: true } }],
  ["target creature that dealt damage this turn", { kind: "permanent", whose: "any", filter: { type: "creature", dealtDamageThisTurn: true } }],
  // A creature in a blocking relation with the source or its host
  // (`blockingRelation`): Goblin Javelineer, Tinder Wall, Plasma Caster.
  ...[
    ["blocking or blocked by", "either"],
    ["that's blocking", "blocking"],
    ["blocking", "blocking"],
  ].flatMap(([words, relation]) =>
    ["it", "~", "this creature"].map((who) => [
      `target creature ${words} ${who}`,
      { kind: "permanent", filter: { type: "creature", blockingRelation: { relation } } },
    ]),
  ),
  ...["it's blocking", "~ is blocking", "this creature is blocking"].map((words) => [
    `target creature ${words}`,
    { kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocked-by" } } },
  ]),
  ...["equipped creature", "enchanted creature"].flatMap((host) =>
    ["blocking", "that's blocking"].map((words) => [
      `target creature ${words} ${host}`,
      { kind: "permanent", filter: { type: "creature", blockingRelation: { relation: "blocking", of: "host" } } },
    ]),
  ),
  // A look back at the turn's blocks (`blockedThisTurn`): Sizzling Barrage.
  ["target creature that blocked this turn", { kind: "permanent", filter: { type: "creature", blockedThisTurn: { relation: "blocked" } } }],
  ["target creature or planeswalker an opponent controls", { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"]} }],
  ["target creature or planeswalker", { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  ["target nonland permanent an opponent controls", "nonland-permanent-an-opponent-controls"],
  ["target nonland permanent you don't control", "nonland-permanent-an-opponent-controls"],
  ["target nonland permanent you control", { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
  ["target creature an opponent controls", "creature-an-opponent-controls"],
  ["target creature you don't control", "creature-an-opponent-controls"],
  ["target artifact an opponent controls", "artifact-an-opponent-controls"],
  ["target artifact you don't control", "artifact-an-opponent-controls"],
  ["target creature you control other than enchanted creature", { kind: "permanent", whose: "you", filter: { type: "creature", hostOfSource: false } }],
  ["target creature other than enchanted creature", { kind: "permanent", whose: "any", filter: { type: "creature", hostOfSource: false } }],
  // Topple: one comparison over every creature on the battlefield.
  ["target creature with the greatest power among creatures on the battlefield", { kind: "permanent", whose: "any", filter: GREATEST_POWER_HERE }],
  ["target creature you control", "creature-you-control"],
  ["target land you control", "land-you-control"],
  ["target artifact or enchantment", "artifact-or-enchantment"],
  ["target creature or enchantment", "creature-or-enchantment"],
  ["target artifact or creature", "artifact-or-creature"],
  ["target nonartifact creature", "nonartifact-creature"],
  ["target nonblack creature", "nonblack-creature"],
  ["target attacking or blocking creature", "attacking-or-blocking-creature"],
  ["target nonland permanent", "nonland-permanent"],
  ["target instant spell, sorcery spell, or triggered ability", "instant-or-sorcery-spell-or-triggered-ability"],
  ["target noncreature spell", "noncreature-spell"],
  ["target instant or sorcery spell", "instant-or-sorcery-spell"],
  ["target creature spell", "creature-spell"],
  ["target spell", "spell"],
  // "Of the chosen color" (Pentarch Paladin): the colour chosen as it
  // entered (`ofChosenColor`).
  ["target permanent of the chosen color", { kind: "permanent", filter: { ofChosenColor: true } }],
  ["target creature of the chosen color", { kind: "permanent", filter: { type: "creature", ofChosenColor: true } }],
  ["target creature", "creature"],
  ["target artifact", "artifact"],
  ["target enchantment", "enchantment"],
  ["target land", "land"],
  ["target permanent or player", "permanent-or-player"],
  // "…, or opponent": a permanent slot a player fits too (`orPlayer`).
  [
    "target artifact, creature, planeswalker, or opponent",
    { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] }, orPlayer: "opponent" },
  ],
  ["target permanent or opponent", { kind: "permanent", filter: {}, orPlayer: "opponent" }],
  ["target permanent you control", { kind: "permanent", whose: "you", filter: {} }],
  ["target permanent", "permanent"],
  ["target player or planeswalker", "player-or-planeswalker"],
  ["target opponent or planeswalker", "opponent-or-planeswalker"],
  ["target player", "player"],
  ["target opponent", "opponent"],
  // One slot over players and permanents, each part with its own filter
  // (`permanent`'s `orPlayer`, rule 115.4 for "any target").
  [
    "target creature, planeswalker, or player",
    { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] }, orPlayer: "any" },
  ],
  [
    "target creature token, player, or planeswalker",
    { kind: "permanent", filter: { anyOf: [{ type: "creature", token: true }, { type: "planeswalker" }] }, orPlayer: "any" },
  ],
  [
    "target opponent, creature an opponent controls, or planeswalker an opponent controls",
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] }, orPlayer: "opponent" },
  ],
  ["any target", "any-target"],
];
/**
 * A target phrase the fixed list doesn't have, read word by word: "target
 * tapped creature", "target attacking creature you control", "target nonbasic
 * land", "target creature with flying", "target creature with power 4 or
 * greater" — a `permanent` spec, or `undefined` for any word it doesn't know.
 */
function modifiedTargetOf(phrase) {
  const m = new RegExp(
    "^target (.+?)(?: (you control|an opponent controls|you don't control))?" +
      "(?: with (flying|reach|power (\\d+) or (greater|less)|toughness (\\d+) or (greater|less)|mana value (\\d+) or (greater|less)))?" +
      // "…that crewed it this turn" / "…that saddled it this turn" (rules
      // 702.122c, 702.171c): tapped for the source's crew or saddle cost.
      "(?: that (crewed|saddled) it this turn)?$",
    "i",
  ).exec(phrase);
  if (m === null) return undefined;
  const words = m[1].split(" ");
  const filter = {};
  // Adjectives before the type, each a filter clause of its own.
  while (words.length > 1) {
    const w = words[0].toLowerCase();
    if (w === "tapped") filter.tapped = true;
    else if (w === "untapped") filter.tapped = false;
    else if (w === "attacking") filter.attacking = true;
    else if (w === "blocking") filter.blocking = true;
    else if (w === "nonbasic") filter.notSupertype = "basic";
    else if (COLOR_WORD[w] !== undefined) filter.colors = [COLOR_WORD[w]];
    else if (/^non(white|blue|black|red|green)$/.test(w)) filter.notColors = [COLOR_WORD[w.slice(3)]];
    else break;
    words.shift();
  }
  const typed = parseTypePhrase(words.join(" "));
  // A permanent target needs a permanent type to stand on.
  if (typed === null || (typed.type === undefined && typed.types === undefined && typed.typesAnyOf === undefined)) {
    return undefined;
  }
  Object.assign(filter, typed);
  const cmp = (n, way) => ({ op: way.toLowerCase() === "greater" ? "gte" : "lte", n: Number(n) });
  if (m[3] !== undefined) {
    if (/^(flying|reach)$/i.test(m[3])) filter.keyword = m[3].toLowerCase();
    else if (m[4] !== undefined) filter.power = cmp(m[4], m[5]);
    else if (m[6] !== undefined) filter.toughness = cmp(m[6], m[7]);
    else if (m[8] !== undefined) filter.manaValue = cmp(m[8], m[9]);
  }
  if (m[10] !== undefined) filter[m[10].toLowerCase() === "crewed" ? "crewedSource" : "saddledSource"] = true;
  const whose = m[2] === undefined ? undefined : m[2].toLowerCase() === "you control" ? "you" : "opponent";
  return { kind: "permanent", ...(whose !== undefined ? { whose } : {}), filter };
}
/** "Any target that isn't a Dragon" (Wrathful Red Dragon), "… a commander"
 * (Lozhan), every player included (rule 115.4, Lozhan's ruling); "target player,
 * planeswalker, or Sliver creature" (Cautery Sliver). */
function partedTargetOf(phrase) {
  const capital = (word) => word[0].toUpperCase() + word.slice(1);
  const isnt = /^any target that isn't an? ([a-z]+)$/.exec(phrase);
  if (isnt !== null) {
    return {
      kind: "permanent",
      filter: {
        typesAnyOf: ["creature", "planeswalker", "battle"],
        ...(isnt[1] === "commander" ? { isCommander: false } : { notSubtypes: [capital(isnt[1])] }),
      },
      orPlayer: "any",
    };
  }
  const creature = /^target player, planeswalker, or ([a-z]+) creature$/.exec(phrase);
  if (creature !== null) {
    return {
      kind: "permanent",
      filter: { anyOf: [{ type: "planeswalker" }, { type: "creature", subtype: capital(creature[1]) }] },
      orPlayer: "any",
    };
  }
  return undefined;
}
const targetOf = (phrase) =>
  TARGET_PHRASES.find(([p]) => p === phrase.toLowerCase())?.[1] ??
  partedTargetOf(phrase.toLowerCase()) ??
  modifiedTargetOf(phrase.toLowerCase());

/** "nonland permanents you control" → "nonland permanent you control". */
const singularTarget = (phrase) => phrase.replace(/s( you control| an opponent controls| you don't control)?$/i, "$1");

/**
 * A target phrase with its quantity, its slots allocated through `ctx.target`:
 * "target creature" and "another target creature" (other than the source —
 * on a permanent's ability only) take one slot, "up to one (other) target …"
 * one `optional` slot, "up to two target creatures" one optional slot each,
 * every one after the first other than those before it (one instance of
 * "target", rule 601.2c — `distinctTargets`), and "any number of (other)
 * target …s" one `any-number` group. Returns the slots, and `group` for an
 * any-number group; `undefined` for a phrase it doesn't read.
 */
function quantifiedSlots(phrase, ctx) {
  let m;
  const other = (of) => (ctx.spell ? undefined : { kind: "other", of });
  // "Up to three target cards from a single graveyard" (Decompose), "two
  // target cards from an opponent's graveyard" (Nullmage Advocate: one
  // opponent's), "X target cards from a single graveyard" (Rats' Feast): a
  // group whose members share a graveyard (`sameController`).
  if ((m = /^(up to )?(two|three|four|five|X) target (?:(.+?) )?cards from (a single|an opponent's) graveyard$/i.exec(phrase))) {
    const x = m[2] === "X";
    const n = x ? "x" : numberOf(m[2]);
    const of = graveyardTargetOf(`target ${m[3] !== undefined ? `${m[3]} ` : ""}card from ${m[4].toLowerCase() === "a single" ? "a" : "an opponent's"} graveyard`);
    if (of === undefined || (!x && typeof n !== "number")) return undefined;
    const group = { kind: "any-number", of, ...(m[1] ? {} : { min: n }), max: n, sameController: true };
    return { slots: [ctx.target(group)], group: true };
  }
  // "… with total mana value N or less" (Patch Up): a group capped by its
  // members' total, "up to N" of them or any number.
  if ((m = /^(any number of|up to (?:two|three|four|five)) (target .+?) with total mana value (\d+) or less( from .+)?$/i.exec(phrase))) {
    const n = m[1].toLowerCase() === "any number of" ? undefined : numberOf(m[1].slice(6));
    const phrase1 = `${m[2]}${m[4] ?? ""}`.replace(/ cards( from )/, " card$1");
    const of = graveyardTargetOf(phrase1) ?? targetOf(singularTarget(phrase1));
    if (of === undefined || (n !== undefined && typeof n !== "number")) return undefined;
    const group = { kind: "any-number", of, ...(n !== undefined ? { max: n } : {}), maxTotalManaValue: Number(m[3]) };
    return { slots: [ctx.target(group)], group: true };
  }
  // "Two target permanents that share a card type" (Shifting Loyalties),
  // "two target creatures you control that share a creature type" (Secret
  // Tunnel), "two target creatures that share no creature types" (Rivals'
  // Duel), "two target creature cards that share a creature type from your
  // graveyard" (Unbury): the second slot other than the first and keeping
  // the relation with it (`shares`).
  if ((m = /^two target (.+?) that share (a card type|a creature type|no creature types)( from your graveyard)?$/i.exec(phrase))) {
    const one = `target ${singularTarget(m[1])}${m[3] ?? ""}`;
    const of = m[3] ? graveyardTargetOf(one) : targetOf(one);
    if (of === undefined) return undefined;
    const kind = /card type/i.test(m[2]) ? "card" : "creature";
    const shares = { kind, ...(/^no /i.test(m[2]) ? { none: true } : {}) };
    const first = ctx.target(of);
    return { slots: [first, ctx.target({ kind: "other", of, than: { slot: first }, shares })] };
  }
  // "Any number of target creatures with equal toughness" (V.A.T.S.), "up
  // to six target creature cards with different names from your graveyard"
  // (Behold the Sinister Six!): a group whose members keep the relation.
  if ((m = /^(any number of|up to (?:two|three|four|five|six)) (target .+?) with (equal toughness|different names)( from .+)?$/i.exec(phrase))) {
    const n = m[1].toLowerCase() === "any number of" ? undefined : numberOf(m[1].slice(6));
    const phrase1 = `${singularTarget(m[2])}${m[4] ?? ""}`;
    const of = m[4] ? graveyardTargetOf(phrase1) : targetOf(phrase1);
    if (of === undefined || (n !== undefined && typeof n !== "number")) return undefined;
    const relation = /toughness/i.test(m[3]) ? { equalToughness: true } : { differentNames: true };
    const group = { kind: "any-number", of, ...(n !== undefined ? { max: n } : {}), ...relation };
    return { slots: [ctx.target(group)], group: true };
  }
  // "Up to X target …" / "X target …" (rule 601.2c): a group as big as the
  // spell's X — or, on a permanent's enters ability, the X it was cast with.
  if ((m = /^(up to )?X target (.+)$/.exec(phrase))) {
    const of = targetOf(`target ${singularTarget(m[2])}`);
    if (of === undefined) return undefined;
    const group = { kind: "any-number", of, ...(m[1] ? {} : { min: "x" }), max: "x" };
    return { slots: [ctx.target(group)], group: true };
  }
  if ((m = /^any number of (other )?target (.+)$/i.exec(phrase))) {
    const of = targetOf(`target ${singularTarget(m[2])}`);
    const spec = of === undefined ? undefined : m[1] ? other(of) : of;
    return spec === undefined ? undefined : { slots: [ctx.target({ kind: "any-number", of: spec })], group: true };
  }
  if ((m = /^up to (one|two|three) (other )?target (.+)$/i.exec(phrase))) {
    const n = numberOf(m[1]);
    const of = targetOf(`target ${n === 1 ? m[3] : singularTarget(m[3])}`);
    if (of === undefined || typeof n !== "number") return undefined;
    if (n === 1) {
      const spec = m[2] ? other(of) : of;
      return spec === undefined ? undefined : { slots: [ctx.target({ kind: "optional", of: spec })] };
    }
    // "Up to two other target …": other than what is a person's call.
    if (m[2]) return undefined;
    const slots = [];
    for (let i = 0; i < n; i += 1) {
      const spec = i === 0 ? of : { kind: "other", of, than: { slots: [...slots] } };
      slots.push(ctx.target({ kind: "optional", of: spec }));
    }
    return { slots };
  }
  if ((m = /^another (target .+)$/i.exec(phrase))) {
    const of = targetOf(m[1]);
    const spec = of === undefined ? undefined : other(of);
    return spec === undefined ? undefined : { slots: [ctx.target(spec)] };
  }
  if (/^target /i.test(phrase)) {
    const of = targetOf(phrase);
    return of === undefined ? undefined : { slots: [ctx.target(of)] };
  }
  return undefined;
}
// Non-capturing: a template wraps it in its own group where it wants the match,
// so a nested group never shifts the numbering of the ones after it. After the
// fixed phrases, a "target …" one `modifiedTargetOf` reads or rejects.
const TARGET = `(?:any target that isn't an? [a-z]+|target player, planeswalker, or [a-z]+ creature|${TARGET_PHRASES.map(([p]) => escapeRe(p)).join("|")}|target [a-z' ]+?(?: with (?:flying|reach|(?:power|toughness|mana value) \\d+ or (?:greater|less)))?)`;

/** "(non-Wall) creature(s) blocking or blocked by this creature", "creatures
 * it's blocking", "creatures blocking enchanted creature": a creature filter
 * with a `blockingRelation` to the source or its host. */
const BLOCK_RELATION =
  "(?:non-[A-Z][a-z]+ )?creatures? (?:blocking or blocked by|blocked by|blocking) (?:it|~|this creature|enchanted creature|equipped creature)";
function blockRelationFilterOf(phrase, it) {
  const m = /^(?:non-([A-Z][a-z]+) )?creatures? (blocking or blocked by|blocked by|blocking) (it|~|this creature|enchanted creature|equipped creature)$/.exec(phrase);
  if (m === null) return undefined;
  const relation = { "blocking or blocked by": "either", "blocked by": "blocked-by", blocking: "blocking" }[m[2]];
  const host = /^(enchanted|equipped) creature$/.test(m[3]);
  // "It" is the object the trigger names, when that's what the ability is
  // about (Trailblazer's Torch, Ib Halfheart).
  const trigger = m[3] === "it" && it === "trigger-object";
  return {
    type: "creature",
    ...(m[1] !== undefined ? { notSubtypes: [m[1]] } : {}),
    blockingRelation: { relation, ...(host ? { of: "host" } : trigger ? { of: "trigger-object" } : {}) },
  };
}

/** "target creature card from your graveyard" and friends. */
/**
 * The first slot of a `put-on-libraries`' targets: "two target lands" (two
 * slots, the second other than the first — one instance of "target", rule
 * 601.2c), "any number of / up to three / two target creature cards from
 * your graveyard" (one `any-number` group), or what `quantifiedSlots` reads
 * ("up to two target artifacts"). `undefined` for anything else.
 */
function libraryPlacementSlot(phrase, ctx) {
  let m;
  if ((m = /^(any number of|up to (two|three|four|five)|(two|three|four|five)) target (?:(.+?) )?cards from (your|a|an opponent's) graveyard$/i.exec(phrase))) {
    const of = graveyardTargetOf(`target ${m[4] !== undefined ? `${m[4]} ` : ""}card from ${m[5].toLowerCase()} graveyard`);
    const word = m[2] ?? m[3];
    const n = word === undefined ? undefined : numberOf(word);
    if (of === undefined || (word !== undefined && typeof n !== "number")) return undefined;
    return ctx.target({ kind: "any-number", of, ...(m[3] !== undefined ? { min: n } : {}), ...(n !== undefined ? { max: n } : {}) });
  }
  if ((m = /^(two|three) target (.+)$/i.exec(phrase))) {
    const n = numberOf(m[1]);
    const of = targetOf(`target ${singularTarget(m[2])}`);
    if (of === undefined || typeof n !== "number") return undefined;
    const slots = [];
    for (let i = 0; i < n; i += 1) slots.push(ctx.target(i === 0 ? of : { kind: "other", of, than: { slots: [...slots] } }));
    return slots[0];
  }
  return quantifiedSlots(phrase, ctx)?.slots[0];
}

/** "Target face-up exiled card" (Pull from Eternity), "target exiled card
 * with flashback you own" (Runic Repetition), "target card with flashback you
 * own from exile" (Rootcoil Creeper), "target creature card with mana value X
 * exiled with this creature" (Gelatinous Cube): a `card-in-exile` slot. */
const EXILE_TARGET =
  "target (?:face-up exiled card|exiled card(?: with flashback)?(?: you own)?|card(?: with flashback)? you own from exile|(?:[a-z]+ )?card(?: with mana value X)? exiled with (?:this [a-z]+|~))";

function exileTargetOf(phrase) {
  if (/^target face-up exiled card$/i.test(phrase)) return { kind: "card-in-exile", faceUp: true };
  let m;
  if ((m = /^target (?:exiled card( with flashback)?( you own)?|card( with flashback)? you own from exile)$/i.exec(phrase))) {
    const flashback = m[1] !== undefined || m[3] !== undefined;
    const own = m[2] !== undefined || m[3] !== undefined || /you own from exile$/i.test(phrase);
    return {
      kind: "card-in-exile",
      ...(own ? { whose: "you" } : {}),
      ...(flashback ? { filter: { hasFlashback: true } } : {}),
    };
  }
  if ((m = /^target (?:([a-z]+) )?card( with mana value X)? exiled with (?:this [a-z]+|~)$/i.exec(phrase))) {
    const parsed = m[1] === undefined ? {} : parseTypePhrase(m[1], { cards: true });
    if (parsed === null) return undefined;
    const filter = m[2] === undefined ? parsed : { ...parsed, manaValue: { op: "eq", n: "x" } };
    return { kind: "card-in-exile", linked: true, ...(Object.keys(filter).length > 0 ? { filter } : {}) };
  }
  return undefined;
}

function graveyardTargetOf(phrase) {
  const m = /^target (?:(.+?) )?card( with mana value X)? from (your|a|an opponent's) graveyard$/i.exec(phrase);
  if (!m) return undefined;
  const parsed = m[1] === undefined ? {} : parseTypePhrase(m[1], { cards: true });
  if (parsed === null) return undefined;
  const filter = m[2] === undefined ? parsed : { ...parsed, manaValue: { op: "eq", n: "x" } };
  const whose = m[3] === "your" ? "you" : m[3] === "a" ? "any" : "opponent";
  return { kind: "card-in-graveyard", whose, ...(Object.keys(filter).length > 0 ? { filter } : {}) };
}

// ----------------------------------------------------------------- costs

const MANA = /^(?:\{(?:\d+|[WUBRGCXS]|[WUBRG]\/[WUBRGP]|2\/[WUBRG])\})+$/;

/**
 * An activated ability's cost, "{2}{G}, {T}, Sacrifice ~" → `{ cost, extra }`
 * (`extra` holds ability-level fields a cost implies: `otherOnly`, `zone`).
 * `null` when any part is one the engine can't pay.
 */
/** A buyback's non-mana cost, "Pay 3 life, Discard a card at random" →
 * `kicker.also`; `null` for any part the engine can't pay. */
function buybackAlso(text) {
  const also = { text };
  for (const part of text.split(/,\s*/)) {
    let m;
    if ((m = /^Pay (\d+) life$/i.exec(part))) also.payLife = Number(m[1]);
    else if (/^Discard a card at random$/i.test(part)) Object.assign(also, { discard: 1, discardAtRandom: true });
    else if ((m = new RegExp(`^Discard ${N} cards?$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      also.discard = count;
    } else if ((m = /^Sacrifice an? (\w+)$/i.exec(part))) {
      const filter = parseTypePhrase(m[1]);
      if (filter === null) return null;
      also.sacrifice = { filter, count: 1 };
    } else return null;
  }
  return also;
}

/** A kicker's or entwine's cost that isn't mana (rule 702.33a, 702.42a —
 * any cost), as `kicker.also`: buyback's parts, a sacrifice of N of a kind
 * ("Sacrifice three lands"), "Return a creature you control to its owner's
 * hand" and "Tap an untapped Vampire you control". One part only. */
function kickerAlso(text) {
  let m;
  // "Exile four cards from your graveyard" (Horobi's Whisper, Ruthless Radrat).
  if ((m = new RegExp(`^Exile ${N} cards from your graveyard$`).exec(text))) {
    const count = numberOf(m[1]);
    return typeof count === "number" ? { text, exileFromGraveyard: { count } } : null;
  }
  // "An opponent gains 5 life" (Roar of Jukai).
  if ((m = /^An opponent gains (\d+) life$/.exec(text))) return { text, opponentGainsLife: Number(m[1]) };
  if ((m = new RegExp(`^Sacrifice (an?|${N.slice(1, -1)}) (.+)$`).exec(text))) {
    const count = /^an?$/.test(m[1]) ? 1 : numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof count !== "number" || filter === null || Object.keys(filter).length === 0) return null;
    return { text, sacrifice: { filter, count } };
  }
  if ((m = /^Return an? (.+?) you control to its owner's hand$/.exec(text))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { text, returnToHand: { filter, count: 1 } };
  }
  if ((m = /^Tap an untapped (.+?) you control$/.exec(text))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { text, tapUntapped: { filter, count: 1 } };
  }
  // "Tap two untapped artifacts, creatures, and/or lands you control" (Warlord's Elite).
  if ((m = new RegExp(`^Tap (${N.slice(1, -1)}) untapped (.+?) you control$`).exec(text))) {
    const count = numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof count !== "number" || filter === null || Object.keys(filter).length === 0) return null;
    return { text, tapUntapped: { filter, count } };
  }
  // "Tap any number of untapped creatures you control" (Burn at the Stake).
  if ((m = /^Tap any number of untapped (.+?) you control$/.exec(text))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { text, tapAnyNumber: { filter } };
  }
  return null;
}

/** A morph cost that isn't mana, as `MorphCost.also` — one part. */
function morphNonManaCost(text) {
  let m;
  if ((m = /^Pay (\d+) life$/.exec(text))) return { payLife: Number(m[1]) };
  // "Morph—Reveal a blue card in your hand" (Dragon's Eye Savants).
  if ((m = /^Reveal an? (white|blue|black|red|green) card in your hand$/.exec(text))) {
    const color = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[m[1]];
    return { reveal: { count: 1, filter: { colors: [color] }, text: `${m[1]} card` } };
  }
  if ((m = new RegExp(`^Sacrifice (another|${N.slice(1, -1)}) (.+)$`).exec(text))) {
    const count = m[1] === "another" ? 1 : numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof count !== "number" || filter === null) return null;
    return { sacrifice: { filter, count } };
  }
  if ((m = /^Discard an? (?:(\w+) )?card$/.exec(text))) {
    if (m[1] === undefined) return { discard: { count: 1 } };
    const filter = parseTypePhrase(m[1], { cards: true });
    return filter === null ? null : { discard: { count: 1, filter } };
  }
  if ((m = new RegExp(`^Return ${N} (.+) you control to (?:its|their) owner's hand$`).exec(text))) {
    const count = numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof count !== "number" || filter === null) return null;
    return { returnToHand: { count, filter } };
  }
  return null;
}

/**
 * A sacrifice cost naming the source as one of its parts, or its host, as a
 * `SacrificeCost` matched against the source: "Sacrifice ~ and another
 * creature" / "… and a creature you control" (`each`, the source first),
 * "Sacrifice two lands and ~" (`each`, the source last), "Sacrifice enchanted
 * creature" (`{ filter: { hostOfSource: true } }`). `null` for anything else.
 */
export function sourceSacrificeOf(part) {
  if (/^Sacrifice (?:enchanted|equipped) creature$/.test(part)) return { filter: { hostOfSource: true } };
  const othersOf = (phrase) => {
    const m = new RegExp(`^(another|${N.slice(1, -1)}) (.+?)(?: you control)?$`).exec(phrase);
    if (m === null) return null;
    const count = m[1] === "another" ? 1 : numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof count !== "number" || count < 1 || filter === null || Object.keys(filter).length === 0) return null;
    return Array.from({ length: count }, () => filter);
  };
  let m;
  // "This creature and any number of other non-Eldrazi creatures" (Emrakul's
  // Evangel): the `parts` form, X the number of others.
  if ((m = /^Sacrifice ~ and any number of other (?:non-([A-Z][a-z]+) )?(.+)$/.exec(part))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    const others = { ...filter, ...(m[1] !== undefined ? { notSubtypes: [m[1]] } : {}), isSource: false };
    return { parts: [{ filter: { isSource: true }, count: 1 }, { filter: others, count: "x" }] };
  }
  if ((m = /^Sacrifice ~ and (.+)$/.exec(part))) {
    const others = othersOf(m[1]);
    return others === null ? null : { each: [{ isSource: true }, ...others] };
  }
  if ((m = /^Sacrifice (.+) and ~$/.exec(part))) {
    const others = othersOf(m[1]);
    return others === null ? null : { each: [...others, { isSource: true }] };
  }
  return null;
}

export function parseCost(text) {
  const cost = { mana: null, tap: false };
  const extra = {};
  // "Pay half your life, rounded up" is one part, its comma aside.
  for (const part of text.replace("Pay half your life, rounded up", "Pay half your life").split(/,\s*/)) {
    let m;
    if (MANA.test(part)) cost.mana = part;
    else if (part === "{T}") cost.tap = true;
    // {Q}, the untap symbol (rule 107.6).
    else if (part === "{Q}") cost.untap = true;
    else if (part === "Sacrifice ~") cost.sacrifice = "self";
    else if (/^Sacrifice (?:~ and |.+ and ~$)/.test(part) || /^Sacrifice (?:enchanted|equipped) creature$/.test(part)) {
      // A sacrifice cost matched against the source: "this creature and a
      // creature you control" (Great Hall of Starnheim), "two lands and this
      // artifact" (Sandstone Deadfall) — an `each` with an `isSource` part —
      // and "enchanted creature" (Betrothed of Fire, `hostOfSource`).
      const sacrifice = sourceSacrificeOf(part);
      if (sacrifice === null) return null;
      cost.sacrifice = sacrifice;
    } else if ((m = /^Sacrifice (an?|another) (.+?) or (an?|another) (.+)$/.exec(part)) && /another/.test(`${m[1]} ${m[3]}`)) {
      // "Sacrifice another creature or an artifact" (Mold Folk): the
      // "another" is its own branch's, `isSource: false` there alone.
      const first = parseTypePhrase(m[2]);
      const second = parseTypePhrase(m[4]);
      if (first === null || second === null || Object.keys(first).length === 0 || Object.keys(second).length === 0) {
        return null;
      }
      const branch = (filter, article) => (article === "another" ? { ...filter, isSource: false } : filter);
      cost.sacrifice = { filter: { anyOf: [branch(first, m[1]), branch(second, m[3])] } };
    } else if ((m = /^Sacrifice (an?|another) (.+) of the chosen type$/.exec(part))) {
      // "Sacrifice a creature of the chosen type" (Doom Cannon): the
      // source's choice, read against it.
      const filter = parseTypePhrase(m[2]);
      if (filter === null || Object.keys(filter).length === 0) return null;
      cost.sacrifice = { filter: { ...filter, ofChosenType: true } };
      if (m[1] === "another") extra.otherOnly = true;
    } else if ((m = /^Sacrifice (a|an|another) (.+)$/.exec(part))) {
      const filter = parseTypePhrase(m[2]);
      if (filter === null) return null;
      cost.sacrifice = Object.keys(filter).length === 1 && filter.type === "creature" ? "creature-you-control" : { filter };
      if (m[1] === "another") extra.otherOnly = true;
    } else if ((m = /^Sacrifice (any number of|one or more|two|three|four|five|six|seven|eight|nine|ten|x|\d+) (.+?)( with different names)?$/i.exec(part))) {
      // "Sacrifice three Foods", "Sacrifice X Goats" (a mana ability's too),
      // "any number of", "one or more" (X, at least 1), "three artifact tokens
      // with different names" (Transmutation Font): chosen as it's paid.
      const word = m[1].toLowerCase();
      const count = word === "any number of" || word === "one or more" ? "x" : numberOf(word);
      const filter = parseTypePhrase(m[2]);
      if (count === undefined || filter === null || Object.keys(filter).length === 0) return null;
      cost.sacrifice = { filter, count, ...(m[3] !== undefined ? { differentNames: true } : {}) };
      if (word === "one or more") extra.minX = 1;
    } else if ((m = /^Pay (\d+) life$/.exec(part))) cost.payLife = Number(m[1]);
    else if (part === "Pay half your life") cost.payLife = "half-rounded-up";
    else if (part === "Pay X life") cost.payLife = "x";
    else if ((m = /^Pay (\d+) life for each ([\w+/-]+) counter on ~$/.exec(part))) {
      cost.payLife = { each: Number(m[1]), per: { countersOnSource: m[2] } };
    } else if ((m = /^Pay (\d+) life for each card in your hand$/.exec(part))) {
      cost.payLife = { each: Number(m[1]), per: "card-in-hand" };
    }
    else if (part === "Discard your hand") cost.discardHand = true;
    // "Discard a card at random" (Mage il-Vec): nothing to choose.
    else if (part === "Discard a card at random") cost.discard = { count: 1, random: true };
    // "Discard a card" (Mesmeric Trance), "Discard a creature card" (Volrath
    // the Fallen): which, chosen as it's paid (rule 602.2b).
    else if ((m = /^Discard an? (?:(\w+) )?card$/.exec(part))) {
      const filter = m[1] === undefined ? undefined : parseTypePhrase(m[1], { cards: true });
      if (filter === null || (filter !== undefined && Object.keys(filter).length === 0)) return null;
      cost.discard = { count: 1, ...(filter !== undefined ? { filter } : {}) };
    } else if ((m = /^Remove all ([+-]\d+\/[+-]\d+|\w+) counters from ~$/i.exec(part))) {
      // Every one there, none allowed; the number removed is the ability's X
      // (Catti-brie of Mithral Hall).
      cost.removeCounter = { kind: m[1], count: "all" };
    } else if ((m = /^Remove (?:X|any number of) ([+-]\d+\/[+-]\d+|\w+) counters from ~$/i.exec(part))) {
      // X announced as it's activated (rules 601.2b, 602.2b), 0 allowed.
      cost.removeCounter = { kind: m[1], count: "x" };
    } else if ((m = new RegExp(`^Remove ${N} ([+-]\\d+/[+-]\\d+|\\w+) counters? from ~$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      cost.removeCounter = { kind: m[2], count };
    } else if ((m = new RegExp(`^Remove ${N} counters? from ~$`, "i").exec(part))) {
      // "Remove a counter from this creature": of any kind it has, chosen as
      // the cost is paid.
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      cost.removeCounter = { kind: "any", count };
    } else if (
      (m = new RegExp(`^Remove ${N} (?:([+-]\\d+/[+-]\\d+|\\w+) counters?|counters?) from (a|an|another|among) (.+?) you control$`, "i").exec(part))
    ) {
      // "Remove a +1/+1 counter from a creature you control", "… from among
      // creatures you control" (rules 602.2b, 601.2h — chosen as it's paid).
      const count = numberOf(m[1]);
      const filter = parseTypePhrase(m[4]);
      if (count === undefined || filter === null) return null;
      cost.removeCounter = {
        kind: m[2] ?? "any",
        count,
        ...(Object.keys(filter).length > 0 ? { from: filter } : { from: {} }),
        ...(m[3].toLowerCase() === "another" ? { excludeSource: true } : {}),
        ...(m[3].toLowerCase() === "among" ? { among: true } : {}),
      };
    } else if ((m = /^Reveal (two|three) cards from your hand that share a color$/.exec(part))) {
      // Illuminated Folio: chosen as it's paid, among the cards that share a
      // colour with enough others (colourless shares none).
      cost.reveal = { count: numberOf(m[1]), filter: {}, text: "cards", shareColor: true };
    } else if ((m = /^Reveal (.+) from your hand$/.exec(part)) && handRevealOf(m[1]) !== null) {
      // "Reveal X white cards from your hand" (the Coldsnap Martyrs, rule
      // 701.20a): X announced as it's activated, the cards chosen as it's paid.
      const { count, filter, noun } = handRevealOf(m[1]);
      cost.reveal = { count, filter, text: noun };
    } else if ((m = /^(\{E\})+$/.exec(part))) cost.payEnergy = part.length / 3;
    // "Collect evidence 3" (rule 701.59a — Forensic Researcher, Cryptex).
    else if ((m = /^Collect evidence (\d+)$/.exec(part))) cost.collectEvidence = Number(m[1]);
    // "Tap enchanted land" (Earthlore): the one permanent the source is on.
    else if (/^Tap (?:enchanted|equipped) (?:creature|land|permanent)$/.test(part)) cost.tapOthers = { count: 1, filter: { hostOfSource: true } };
    else if ((m = new RegExp(`^Tap ${N} untapped (.+?) you control$`, "i").exec(part))) {
      // "Tap X untapped artifacts you control": announced as it's activated.
      const count = numberOf(m[1]);
      const filter = parseTypePhrase(m[2]);
      if (count === undefined || filter === null) return null;
      cost.tapOthers = { count, filter: { ...filter, controlledBy: "you" } };
    } else if ((m = new RegExp(`^Tap ${N} untapped (.+?) you control that share a creature type$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      const filter = parseTypePhrase(m[2]);
      if (typeof count !== "number" || filter === null) return null;
      cost.tapOthers = { count, shareCreatureType: true, filter: { ...filter, controlledBy: "you" } };
    } else if (part === "Exile ~ from your graveyard") extra.zone = "graveyard";
    else if (part === "Exile ~ from your hand") {
      extra.zone = "hand";
      extra.exilesFromHand = true;
    } else if (part === "Discard ~") extra.zone = "hand";
    else if (part === "Exile ~") cost.exileSelf = true;
    // The secret chosen for this permanent (`GameObject.secretChoice`).
    else if (part === "Reveal the player you chose" || part === "Reveal the creature type you chose") cost.revealChosen = true;
    // "Exile a card from your hand" (Cadaverous Bloom), "Exile a creature you
    // control" (Food Chain: `sacrifice` paid by exile), "Exile an instant or
    // sorcery spell you control" (Nivmagus Elemental), "Exile two creature
    // cards from a single graveyard" (Night Soil).
    else if (part === "Exile a card from your hand") cost.exileFromHand = { count: 1 };
    else if ((m = /^Exile (?:an?|another) (.+?) spell you control$/.exec(part))) {
      const filter = parseTypePhrase(m[1]);
      if (filter === null || Object.keys(filter).length === 0) return null;
      cost.exileSpell = { filter };
    } else if (part === "Exile a spell you control") cost.exileSpell = {};
    else if ((m = /^Exile (an?|another) (.+?) you control$/.exec(part))) {
      const filter = parseTypePhrase(m[2]);
      if (filter === null || Object.keys(filter).length === 0) return null;
      cost.sacrifice = { filter: { ...filter, controlledBy: "you" } };
      cost.exilesSacrifice = true;
      if (m[1] === "another") extra.otherOnly = true;
    } else if ((m = new RegExp(`^Exile ${N} (?:(.+?) )?cards from a single graveyard$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      const filter = m[2] === undefined ? undefined : parseTypePhrase(m[2]);
      if (typeof count !== "number" || filter === null || (filter !== undefined && Object.keys(filter).length === 0)) return null;
      cost.exileFromGraveyard = { count, ...(filter !== undefined ? { filter } : {}), singleGraveyard: true };
    }
    // "Exile the top card of your library" (Royal Herbalist), "the top two
    // cards" (Whirling Catapult).
    // "Exile a creature card from your graveyard": one, chosen as it's paid.
    else if ((m = /^Exile an? (?:(.+?) )?card from your graveyard$/.exec(part))) {
      const filter = m[1] === undefined ? undefined : parseTypePhrase(m[1]);
      if (filter === null || (filter !== undefined && Object.keys(filter).length === 0)) return null;
      cost.exileFromGraveyard = { count: 1, ...(filter !== undefined ? { filter } : {}) };
    } else if ((m = /^Exile the top (?:(.+?) )?card of your graveyard$/.exec(part))) {
      // Graveyard order (rule 404.2): no choice (Alms, Necratog).
      const filter = m[1] === undefined ? undefined : parseTypePhrase(m[1]);
      if (filter === null || (filter !== undefined && Object.keys(filter).length === 0)) return null;
      cost.exileFromGraveyard = { count: 1, ...(filter !== undefined ? { filter } : {}), fromTop: true };
    } else if (part === "Exile the top card of your library") cost.exileTop = 1;
    else if ((m = new RegExp(`^Exile the top ${N} cards of your library$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      cost.exileTop = count;
    }
    // A processor's "Put a card an opponent owns from exile into that
    // player's graveyard" (Void Attendant), chosen as it's paid.
    else if (part === "Put a card an opponent owns from exile into that player's graveyard") cost.putFromExile = 1;
    // "Exert this creature" as a cost (rule 701.43 — Steward of Solidarity).
    else if (part === "Exert ~") cost.exertSelf = true;
    // "Unattach this Equipment" (rule 701.3d — Sunforger).
    else if (part === "Unattach ~") cost.unattach = "self";
    // Blight N (rule 701.68a), chosen as it's paid.
    else if ((m = /^Blight (\d+)$/.exec(part))) cost.blight = Number(m[1]);
    // Waterbend {N} (rule 701.67a): the mana, some of it maybe paid by tapping.
    else if ((m = /^Waterbend (\{(?:\d+|X)\})$/.exec(part)) && cost.mana === null) {
      cost.mana = m[1];
      cost.waterbend = true;
    } else return null;
  }
  // Without a {T} of its own, the source may be one of the creatures it taps
  // (Nullmage Shepherd).
  if (cost.tapOthers !== undefined && !cost.tap && cost.tapOthers.filter.hostOfSource !== true) {
    cost.tapOthers = { ...cost.tapOthers, includeSelf: true };
  }
  return { cost, extra };
}

// -------------------------------------------------------------- triggers

const STEPS = {
  upkeep: "upkeep",
  "draw step": "draw",
  "end step": "end",
  "precombat main phase": "precombat-main",
  // Rule 505.1a: only the first main phase of a turn is a precombat one.
  "first main phase": "precombat-main",
  "postcombat main phase": "postcombat-main",
  "postcombat main phases": "postcombat-main",
};
const WHO_STEP = {
  your: "you",
  "each of your": "you",
  each: "any",
  the: "any",
  "each opponent's": "opponent",
  "each player's": "any",
  // A Curse's "enchanted player's upkeep": the step of the player it's attached to.
  "enchanted player's": "attached",
  // Black Vise's "the chosen player's upkeep" (`choosePlayerOnEnter`).
  "the chosen player's": "chosen-player",
};

/**
 * A trigger clause ("Whenever another creature you control enters") as one or
 * more trigger specs — two for "enters or attacks". `null` when no template
 * matches.
 */
export function parseTrigger(clause) {
  const c = clause.replace(/\s+/g, " ").trim();
  let m;
  const self = (on) => [{ on, who: "self" }];
  // Two triggers, as Aven Riftwatcher's and Sundering Titan's are written.
  if (/^When (?:this creature|~) enters or leaves the battlefield$/.test(c)) {
    return [...self("enters-battlefield"), ...self("leaves-battlefield")];
  }
  // Once per tapping at the same time (`batched`), however many of them.
  if ((m = /^Whenever one or more (creatures|nontoken [A-Z][a-z]+|[A-Z][a-z]+) you control become tapped$/.exec(c))) {
    const filter =
      m[1] === "creatures"
        ? { type: "creature" }
        : m[1].startsWith("nontoken ")
          ? { subtype: m[1].slice("nontoken ".length), token: false }
          : { subtype: m[1].replace(/s$/, "") };
    return [{ on: "becomes-tapped", who: "you-control", filter, batched: true }];
  }
  if (/^When(?:ever)? ~ enters$/.test(c)) return self("enters-battlefield");
  if (/^When(?:ever)? ~ enters or attacks$/.test(c)) return [...self("enters-battlefield"), ...self("attacks")];
  if (/^When(?:ever)? ~ dies$/.test(c)) return self("dies");
  if (/^When(?:ever)? ~ leaves the battlefield$/.test(c)) return self("leaves-battlefield");
  // Changes of control (rule 603.10d): Khârn the Betrayer, Risky Move, Zidane.
  if (/^When you lose control of ~$/.test(c)) return self("loses-control");
  if (/^When you gain control of ~ from another player$/.test(c)) return self("gains-control");
  if (/^Whenever an opponent gains control of a permanent from you$/.test(c)) return [{ on: "control-taken" }];
  // "Whenever a permanent is returned to a player's hand" (Warped Devotion),
  // "Whenever a nontoken permanent is put into a player's graveyard from the
  // battlefield" (Liability).
  if ((m = /^Whenever an? (.+?) is (returned to a player's hand|put into a player's graveyard from the battlefield)$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null) return null;
    return [
      {
        on: "leaves-battlefield",
        who: "any",
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
        to: [m[2].startsWith("returned") ? "hand" : "graveyard"],
      },
    ];
  }
  // "Whenever a player taps a nonbasic land for mana" (Burning Earth), "whenever
  // an opponent taps a Mountain for mana" (Sanctimony), "whenever a land is
  // tapped for mana" (Storm Cauldron), "whenever you tap ~ for mana" (Zhur-Taa
  // Druid): rule 106.12a, as the mana ability resolves and produces mana.
  if (/^Whenever you tap ~ for mana$/.test(c)) return [{ on: "tapped-for-mana", who: "self" }];
  // A filter's name read off the card linked to this one (rule 607.2a, the
  // exile linked below by "same name as the exiled card"): Extraplanar Lens,
  // Invader Parasite.
  if ((m = /^Whenever an? (.+?)( an opponent controls)? with the same name as the exiled card (enters|is tapped for mana)$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null) return null;
    const on = m[3] === "enters" ? "enters-battlefield" : "tapped-for-mana";
    return [
      {
        on,
        who: "any",
        filter: { ...filter, sameNameWith: "exiled-with-source", ...(m[2] ? { controlledBy: "opponent" } : {}) },
      },
    ];
  }
  // Eye of Singularity: "a permanent other than a basic land".
  if (/^Whenever a permanent other than a basic land enters$/.test(c)) {
    return [{ on: "enters-battlefield", who: "any", filter: { notSupertype: "basic" } }];
  }
  if ((m = /^Whenever (a player|an opponent|you) taps? (?:a|an) (.+) for mana$/.exec(c)) || (m = /^Whenever ()(?:a|an) (.+) is tapped for mana$/.exec(c))) {
    const filter = m[2] === "nonbasic land" ? { type: "land", notSupertype: "basic" } : parseTypePhrase(m[2]);
    if (filter === null) return null;
    const who = m[1] === "an opponent" ? "opponent" : m[1] === "you" ? "you-control" : "any";
    return [{ on: "tapped-for-mana", who, filter }];
  }
  // "Whenever Don & Raph attack": a plural name.
  if (/^Whenever ~ attacks?$/.test(c)) return self("attacks");
  if (/^Whenever ~ blocks$/.test(c)) return self("blocks");
  if (/^Whenever ~ becomes blocked$/.test(c)) return self("becomes-blocked");
  // The attacker is the trigger object (`itOf`), whoever's it is: "equipped
  // creature", "another Goblin you control", "a creature you control with
  // menace", "a Beast".
  if (/^Whenever (?:equipped|enchanted) creature becomes blocked$/.test(c)) return [{ on: "becomes-blocked", who: "attached" }];
  if ((m = /^Whenever (another|an?) (.+?) you control( with [a-z]+)? becomes blocked$/.exec(c))) {
    const type = parseTypePhrase(m[2]);
    const keyword = m[3] === undefined ? undefined : KEYWORDS[m[3].slice(" with ".length)];
    if (type === null || (m[3] !== undefined && keyword === undefined)) return null;
    const filter = { ...type, ...(keyword !== undefined ? { keyword } : {}) };
    return [{ on: "becomes-blocked", who: "you-control", filter, ...(m[1] === "another" ? { otherOnly: true } : {}) }];
  }
  if ((m = /^Whenever an? ([A-Z][a-z]+) becomes blocked$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    return filter === null ? null : [{ on: "becomes-blocked", who: "any", filter }];
  }
  // Rule 509.3g: as blockers are declared, with none declared for it.
  if (/^Whenever ~ attacks and isn't blocked$/.test(c)) return self("attacks-unblocked");
  // State triggers (rule 603.8): a state of ~'s counters, or of what you
  // control.
  if ((m = /^When(?:ever)? (?:there are (\w+) or more (\w+) counters on ~|~ has (\w+) or more (\w+) counters on it)$/.exec(c))) {
    const n = numberOf(m[1] ?? m[3]);
    if (typeof n !== "number") return null;
    return [{ on: "state", state: { kind: "self-counters", counter: m[2] ?? m[4], compare: { op: "gte", n } } }];
  }
  if ((m = /^When ~ has no (\w+) counters on it$/.exec(c))) {
    return [{ on: "state", state: { kind: "self-counters", counter: m[1], compare: { op: "eq", n: 0 } } }];
  }
  // Call to Arms (rule 603.8): the same test as its static, the other way up.
  if (c === "When the chosen color isn't the most common color among nontoken permanents the chosen player controls or is tied for most common") {
    const leads = { kind: "most-common-color", color: "chosen", among: { nontoken: true, chosenPlayer: true }, untied: true };
    return [{ on: "state", state: { kind: "not", of: leads } }];
  }
  if ((m = /^When you control (no|an?) (.+)$/.exec(c))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null) return null;
    const controls = { kind: "controls", filter, atLeast: 1 };
    return [{ on: "state", state: m[1] === "no" ? { kind: "not", of: controls } : controls }];
  }
  if (/^Whenever ~ attacks or blocks$/.test(c)) return [...self("attacks"), ...self("blocks")];
  // Mutate (rule 702.140d).
  if (/^Whenever ~ mutates$/.test(c)) return self("mutates");
  if (/^Whenever a creature you control mutates$/.test(c)) return [{ on: "mutates", who: "you-control" }];
  // Cycling (rule 702.29): "whenever you cycle a card / another card".
  if ((m = /^Whenever you cycle (a|another) card$/.exec(c))) {
    return [{ on: "cycles", who: "you", ...(m[1] === "another" ? { otherOnly: true } : {}) }];
  }
  if (c === "When you cycle this card") return [{ on: "this-cycled" }];
  // Foretell (rule 702.143a): "whenever you foretell a card".
  if (c === "Whenever you foretell a card") return [{ on: "foretells", who: "you" }];
  // The renowned designation (rule 702.112b) becoming true.
  if (/^When(?:ever)? ~ becomes renowned$/.test(c)) return self("becomes-renowned");
  if (/^Whenever a creature you control becomes renowned$/.test(c)) return [{ on: "becomes-renowned", who: "you-control", filter: { type: "creature" } }];
  // A saddled designation (rule 702.171b) becoming true: "for the first time
  // each turn" only when it wasn't saddled already.
  if ((m = /^Whenever ~ becomes saddled( for the first time each turn)?$/.exec(c))) {
    return [{ on: "becomes-saddled", who: "self", ...(m[1] ? { firstTimeEachTurn: true } : {}) }];
  }
  // Enlisting (rule 702.154c): it tapped a creature for its enlist cost.
  if (/^Whenever ~ enlists a creature$/.test(c)) return self("enlists");
  // Crewing and saddling (rules 702.122b, 702.171c): it was tapped for a
  // Vehicle's crew cost or a Mount's saddle cost — that Vehicle or Mount the
  // trigger object. "During your main phase" is read with the clause.
  if ((m = /^Whenever ~ (crews a Vehicle|saddles a Mount|saddles a Mount or crews a Vehicle|crews a Vehicle or saddles a Mount)$/.exec(c))) {
    const as = [...(/crews/.test(m[1]) ? ["crew"] : []), ...(/saddles/.test(m[1]) ? ["saddle"] : [])];
    return [{ on: "crews-or-saddles", who: "self", as }];
  }
  if (/^Whenever ~ deals combat damage to a player$|^Whenever ~ deals combat damage to an opponent$/.test(c)) {
    return self("deals-combat-damage-to-player");
  }
  if (c === "Whenever ~ deals damage") return [{ on: "deals-damage", who: "self" }];
  if (c === "Whenever ~ is dealt damage") return [{ on: "dealt-damage", who: "self" }];
  if (/^Whenever ~ deals combat damage to a player or battle$/.test(c)) {
    return [{ on: "deals-combat-damage-to-player", who: "self", orBattle: true }];
  }
  // "Whenever ~ deals [combat] damage to a creature" (Ohran Viper), whoever's
  // weapon it is (Neko-Te's "equipped creature", Sosuke's "a Warrior you
  // control"): `itOf` reads "that creature". A player, for the host alone.
  if (
    (m = /^Whenever (~|enchanted creature|equipped creature|a .+? you control) deals (combat )?damage to (a creature|a player)$/.exec(c)) &&
    (m[3] === "a creature" || /^(?:enchanted|equipped) creature$/.test(m[1]))
  ) {
    const host = /^(?:enchanted|equipped) creature$/.test(m[1]);
    if (m[3] === "a player" && m[2] !== undefined) return [{ on: "deals-combat-damage-to-player", who: "attached" }];
    const filter = m[1].startsWith("a ") ? parseTypePhrase(m[1].slice(2, -" you control".length)) : undefined;
    if (filter === null) return null;
    return [{
      on: "deals-damage",
      who: m[1] === "~" ? "self" : host ? "attached" : "you-control",
      ...(filter !== undefined ? { filter } : {}),
      to: m[3] === "a player" ? "player" : "creature",
      ...(m[2] !== undefined ? { combat: true } : {}),
    }];
  }
  if (/^Whenever ~ is dealt damage$/.test(c)) return self("dealt-damage");
  if (c === "Whenever enchanted player is dealt damage") return [{ on: "deals-damage-batch", who: "any", to: "enchanted-player" }];
  if (/^Whenever ~ becomes the target of a spell or ability an opponent controls$/.test(c)) {
    return [{ on: "becomes-target", who: "self", byOpponentOnly: true }];
  }
  // "Whenever another creature you control becomes the target of a spell or
  // ability" (Monk Gyatso): its trigger object is the creature.
  if ((m = /^Whenever (another|a) (\w+) you control becomes the target of a spell or ability$/.exec(c))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null || filter.type === undefined) return null;
    return [{ on: "becomes-target", who: "you-control", filter, ...(m[1] === "another" ? { otherOnly: true } : {}) }];
  }
  // A player becoming a target (rule 115.7): "whenever you become the target
  // of a spell[ or ability][ an opponent controls]" (Amulet of Safekeeping,
  // Dormant Gomazoa), "whenever you or a permanent you control becomes …"
  // (Unsettled Mariner), "whenever a player or permanent becomes the target
  // of an ability you control" (Loki).
  if ((m = /^Whenever (you become|you or a permanent you control becomes|a player or permanent becomes) the target of (a spell or ability|a spell|an ability)( an opponent controls| you control)?$/.exec(c))) {
    const by = m[3] === " an opponent controls" ? { byOpponentOnly: true } : m[3] === " you control" ? { byControllerOnly: true } : {};
    const kind = m[2] === "a spell" ? { spellOnly: true } : m[2] === "an ability" ? { abilityOnly: true } : {};
    const whose =
      m[1] === "you become"
        ? { who: "self", player: "you", playerOnly: true }
        : m[1].startsWith("you or") ? { who: "you-control", player: "you" } : { who: "any", player: "any" };
    return [{ on: "becomes-target", ...whose, ...by, ...kind }];
  }
  // "For the first time each turn", by anyone's spell or ability (Angelic Cub).
  if (/^Whenever ~ becomes the target of a spell or ability for the first time each turn$/.test(c)) {
    return [{ on: "becomes-target", who: "self", firstTimeEachTurnByAnyone: true }];
  }
  if (/^When you cast (?:~|this spell)$/.test(c)) return [{ on: "this-cast" }];
  // Plot (rule 702.170): it triggers from exile, for this card alone.
  if (/^When (?:~|this card) becomes plotted$/.test(c)) return [{ on: "this-plotted" }];
  // Committing a crime (rule 700.13). "During your turn" is a person's: a
  // `your-turn` condition beside it.
  if (/^Whenever you commit a crime$/.test(c)) return [{ on: "crime-committed", who: "you" }];
  if (/^Whenever an opponent commits a crime$/.test(c)) return [{ on: "crime-committed", who: "opponent" }];
  // Collect evidence (rule 701.59).
  if (/^Whenever you collect evidence$/.test(c)) return [{ on: "evidence-collected", who: "you" }];
  if (/^Whenever you discover$/.test(c)) return [{ on: "discovers", who: "you" }];
  // Explore (rule 701.44b).
  if (/^Whenever (?:~|this creature) explores$/.test(c)) return [{ on: "explores", who: "self" }];
  // Training's "trains" (rule 702.149c) and exploit's "exploits" (702.110b).
  if (/^Whenever (?:~|this creature) trains$/.test(c)) return [{ on: "trains", who: "self" }];
  if (/^When (?:~|this creature) exploits a creature$/.test(c)) return [{ on: "exploits", who: "self" }];
  if ((m = /^Whenever a creature you control exploits a (nontoken )?creature$/.exec(c))) {
    return [{ on: "exploits", who: "you-control", ...(m[1] ? { filter: { type: "creature", token: false } } : {}) }];
  }
  if ((m = /^Whenever a creature you control explores(?: an? (land|nonland) card)?$/.exec(c))) {
    return [{ on: "explores", who: "you", filter: { type: "creature" }, ...(m[1] ? { revealed: m[1] } : {}) }];
  }
  if (/^Whenever you attack$/.test(c)) return [{ on: "attack-with", who: "you", atLeast: 1 }];
  // "Whenever you attack with two or more creatures", "with exactly two",
  // "creatures with total power 12 or greater for the first time each turn".
  if ((m = /^Whenever you attack with (two|three|four|five|six|seven|eight|nine|ten) or more creatures$/.exec(c))) {
    return [{ on: "attack-with", who: "you", atLeast: NUMBERS[m[1]] }];
  }
  if ((m = /^When(?:ever)? you attack with exactly (two|three|four|five) creatures$/.exec(c))) {
    return [{ on: "attack-with", who: "you", exactly: NUMBERS[m[1]] }];
  }
  if ((m = /^Whenever you attack with creatures with total power (\d+) or greater( for the first time each turn)?$/.exec(c))) {
    const totalPower = { atLeast: Number(m[1]), ...(m[2] ? { firstTimeEachTurn: true } : {}) };
    return [{ on: "attack-with", who: "you", totalPower }];
  }
  // "Whenever two or more creatures you control attack a player": each player
  // attacked judged alone (Landroval, Horizon Witness).
  if ((m = /^Whenever (two|three|four|five) or more creatures you control attack a player$/.exec(c))) {
    return [{ on: "attacks-player", who: "you", defender: "any", atLeast: NUMBERS[m[1]] }];
  }
  // "Whenever one or more creatures attack you / one of your opponents": once
  // per player attacked; `triggerBatch` is those attacking that player.
  if (c === "Whenever one or more creatures attack you") return [{ on: "attacks-player", who: "any", defender: "you" }];
  if (c === "Whenever one or more creatures attack one of your opponents") {
    return [{ on: "attacks-player", who: "any", defender: "opponent" }];
  }
  if (c === "Whenever one or more creatures attack") return [{ on: "attacks-batch", who: "any" }];
  if ((m = /^Whenever one or more creatures you control(?: with power (\d+) or greater)? attack$/.exec(c))) {
    const filter = m[1] ? { filter: { type: "creature", power: { op: "gte", n: Number(m[1]) } } } : {};
    return [{ on: "attacks-batch", who: "you", ...filter }];
  }
  // "Whenever one or more Merfolk you control attack a player": once per
  // player, by the attackers that match (Attuma, Atlantean Warlord).
  if ((m = /^Whenever one or more (.+?) you control attack a player$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null) return [{ on: "attacks-player", who: "you", defender: "any", filter }];
  }
  // A Curse's "whenever a creature attacks enchanted player": once per creature.
  if (c === "Whenever a creature attacks enchanted player") {
    return [{ on: "attacks", who: "any", attackedPlayer: "attached" }];
  }
  // Day and night (rule 731.1a).
  if (/^Whenever day becomes night or night becomes day$/.test(c)) return [{ on: "day-night-changes" }];
  if ((m = /^Whenever (day becomes night|night becomes day)$/.exec(c))) {
    return [{ on: "day-night-changes", becomes: m[1] === "day becomes night" ? "night" : "day" }];
  }
  // "When the fourth plan counter is put on this enchantment" (a Plan, Midnight Clock): the placement crossing N.
  if ((m = /^When the (second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) (\S+) counter is put on (?:~|this [a-z]+)$/.exec(c))) {
    const nth = ["second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"].indexOf(m[1]) + 2;
    return [{ on: "counters-put", who: "self", counter: m[2], nth }];
  }

  // "Whenever [another] [nontoken] <type> [you control | an opponent controls] enters / dies / attacks"
  // "Whenever ~ or another creature you control dies": the two triggers it is
  // (`thisOrAnother`) — the source itself, whatever it is by then, and every
  // other one matching.
  if ((m = /^Whenever ~ or another (.+?) you control (dies|leaves the battlefield)$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    // A type to stand on ("another Zombie" is a creature — a person's call).
    if (filter === null || (filter.type === undefined && filter.typesAnyOf === undefined)) return null;
    const on = m[2] === "dies" ? "dies" : "leaves-battlefield";
    return [
      { on, who: "self" },
      { on, who: "you-control", filter, otherOnly: true },
    ];
  }
  // "Whenever a creature dealt damage by ~ this turn dies" (Sengir Vampire) —
  // by this source, or by the one it's attached to (Vampiric Embrace).
  if ((m = /^Whenever a (.+?) dealt damage by (~|enchanted creature|equipped creature) this turn dies$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null) return null;
    return [
      {
        on: "dies",
        who: "any",
        filter: { type: "creature", ...filter, damagedThisTurnBy: { source: m[2] === "~" ? "this" : "host" } },
      },
    ];
  }
  if (
    (m =
      /^Whenever (a|an|another) (.+?)(?: (you control|an opponent controls))? (enters|dies|attacks|leaves the battlefield|is put into a graveyard from the battlefield)$/.exec(
        c,
      ))
  ) {
    // "A green nontoken creature" (Verdant Succession): one color first.
    const colorWord = /^(white|blue|black|red|green) (.+)$/.exec(m[2]);
    let filter = parseTypePhrase(colorWord !== null ? colorWord[2] : m[2]);
    if (filter === null) return null;
    if (colorWord !== null) filter = { ...filter, colors: [COLOR_WORD[colorWord[1]]] };
    // Only a creature dies (rule 700.4): the `dies` trigger is any trip from
    // the battlefield to a graveyard, so "a Human you control dies" says so —
    // or a noncreature changeling going there would count.
    if (m[4] === "dies" && filter.type === undefined && filter.types === undefined && filter.typesAnyOf === undefined) {
      filter = { type: "creature", ...filter };
    }
    const on = {
      enters: "enters-battlefield",
      dies: "dies",
      attacks: "attacks",
      "leaves the battlefield": "leaves-battlefield",
      "is put into a graveyard from the battlefield": "dies",
    }[m[4]];
    if (on === "attacks" && m[3] !== "you control") return null;
    const who = m[3] === "you control" ? "you-control" : "any";
    if (m[3] === "an opponent controls") filter.controlledBy = "opponent";
    // "Another permanent leaves the battlefield" is any of them: no filter.
    const any = on === "leaves-battlefield" && Object.keys(filter).length === 0;
    return [{ on, who, ...(any ? {} : { filter }), ...(m[1] === "another" ? { otherOnly: true } : {}) }];
  }
  // "Whenever one or more [other] creatures [you control] die": once per
  // simultaneous event. (With "this ability triggers only once each turn" it's
  // a plain `dies`, which `parseFace` makes of it.)
  if (
    (m =
      /^Whenever one or more (other )?(.+?)(?: (you control|an opponent controls))? (die|are put into a graveyard from the battlefield)$/.exec(
        c,
      ))
  ) {
    const attacking = /^attacking (.+)$/.exec(m[2]);
    const kind = attacking !== null ? attacking[1] : m[2];
    const filter = kind === "artifacts and/or creatures" ? { typesAnyOf: ["artifact", "creature"] } : parseTypePhrase(kind);
    if (filter !== null) {
      if (attacking !== null) filter.attacking = true;
      // Only a creature dies (rule 700.4).
      if (m[4] === "die" && filter.type === undefined && filter.types === undefined && filter.typesAnyOf === undefined) {
        filter.type = "creature";
      }
      if (m[3] === "an opponent controls") filter.controlledBy = "opponent";
      const who = m[3] === "you control" ? "you-control" : "any";
      return [{ on: "dies", who, filter, ...(m[1] !== undefined ? { otherOnly: true } : {}), batched: true }];
    }
  }
  // "Whenever a creature with a counter on it attacks one of your opponents"
  // (Skyboon Evangelist, Soulblade Corrupter): whoever controls it, attacking
  // the player — not a planeswalker or battle of theirs (rule 508.3a).
  if ((m = /^Whenever (a|an) (enchanted )?(.+?)( with an? (?:(\+1\/\+1|[a-z]+) )?counter on it)? attacks one of your opponents$/.exec(c))) {
    const filter = parseTypePhrase(m[3]);
    if (filter === null) return null;
    const counters = m[4] ? { counters: { ...(m[5] ? { kind: m[5] } : {}), compare: { op: "gte", n: 1 } } } : {};
    const enchanted = m[2] ? { enchanted: true } : {};
    return [{ on: "attacks", who: "any", filter: { ...filter, ...enchanted, ...counters, attackingOpponent: true } }];
  }
  if ((m = /^Whenever (a|another) (.+?) you control deals combat damage to a player$/.exec(c))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null) return null;
    return [{ on: "deals-combat-damage-to-player", who: "you-control", filter, ...(m[1] === "another" ? { otherOnly: true } : {}) }];
  }
  if ((m = /^Whenever one or more (.+?) you control deal combat damage to a player$/.exec(c))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null) return null;
    return [{ on: "deals-damage-batch", who: "you-control", filter, combat: true }];
  }

  // Casting.
  // "A spell with the same name as a card in your / their graveyard" (rule
  // 201.2a): Pyromancer Ascension's yours, Dragonlord Kolaghan's the caster's.
  if ((m = /^Whenever (you|an opponent|a player) casts? an? (.+?) spell (?:that has|with) the same name as a card in (your|their) graveyard$/.exec(c))) {
    const who = { you: "you", "an opponent": "opponent", "a player": "any" }[m[1]];
    const filter = parseTypePhrase(m[2]);
    if (filter === null) return null;
    const graveyard = m[3] === "your" ? { graveyard: { ownedBy: "you" } } : { graveyard: {}, itsController: true };
    return [{ on: "cast-spell", who, filter: { ...filter, sameNameWith: graveyard } }];
  }
  // "Whenever you cast an instant spell from your hand" (Ojer Pakpatiq).
  if ((m = /^Whenever you cast an? (?:(.+?) )?spell from your (hand|graveyard)$/.exec(c))) {
    const filter = m[1] === undefined ? undefined : parseTypePhrase(m[1]);
    if (filter === null) return null;
    return [{ on: "cast-spell", who: "you", from: m[2], ...(filter !== undefined ? { filter } : {}) }];
  }
  if ((m = /^When(?:ever)? (you|an opponent|a player) casts? (a|an|your first|their first) (?:(.+?) )?spell(?: each turn)?$/.exec(c))) {
    const who = { you: "you", "an opponent": "opponent", "a player": "any" }[m[1]];
    const spec = { on: "cast-spell", who };
    if (/first/.test(m[2])) spec.firstEachTurn = true;
    if (m[3] !== undefined) {
      // "Your first noncreature spell each turn" counts noncreature spells
      // (Esper Sentinel's `filter`); `noncreatureOnly` with `firstEachTurn`
      // would be "your first spell, if it's noncreature".
      if (m[3] === "noncreature" && spec.firstEachTurn === true) spec.filter = { notTypes: ["creature"] };
      else if (m[3] === "noncreature") spec.noncreatureOnly = true;
      else {
        const filter = parseTypePhrase(m[3]);
        if (filter === null) return null;
        spec.filter = filter;
      }
    }
    return [spec];
  }
  // "A spell of the chosen color" (Curse of Wizardry) / "a creature spell of
  // the chosen type" (Vanquisher's Banner): what was chosen as it entered.
  if ((m = /^Whenever (you|an opponent|a player) casts? an? (creature )?spell of the chosen (color|type)$/.exec(c))) {
    const who = { you: "you", "an opponent": "opponent", "a player": "any" }[m[1]];
    const filter = m[3] === "color" ? { ofChosenColor: true } : { ofChosenType: true };
    return [{ on: "cast-spell", who, filter: m[2] ? { type: "creature", ...filter } : filter }];
  }
  // "A spell that has convoke" (Kasla, the Broken Halo): convoked or not.
  if (/^Whenever you cast (?:a|another) spell that has convoke$/.test(c)) {
    return [{ on: "cast-spell", who: "you", filter: { hasConvoke: true } }];
  }
  if (/^Whenever you cast or copy an instant or sorcery spell$/.test(c)) {
    return [{ on: "cast-spell", who: "you", orCopy: true, filter: { typesAnyOf: ["instant", "sorcery"] } }];
  }

  // Players.
  if ((m = /^Whenever (you|an opponent|a player) draws? a card$/.exec(c))) {
    return [{ on: "draws", who: { you: "you", "an opponent": "opponent", "a player": "any" }[m[1]] }];
  }
  // Booby Trap's "when the chosen player draws a card with the chosen name"
  // (`choosePlayerOnEnter` and `chooseCardNameOnEnter`).
  if (/^When the chosen player draws a card with the chosen name$/.test(c)) {
    return [{ on: "draws", who: "chosen-player", filter: { chosenName: true } }];
  }
  if (/^Whenever you gain life$/.test(c)) return [{ on: "gains-life", who: "you" }];
  // Expend N (rule 700.14) and "whenever you forage" (701.61a).
  if ((m = /^Whenever you expend (\d+)$/.exec(c))) return [{ on: "expend", who: "you", amount: Number(m[1]) }];
  if (/^Whenever you forage$/.test(c)) return [{ on: "forages", who: "you" }];
  if ((m = /^Whenever (you lose|an opponent loses) life$/.exec(c))) {
    return [{ on: "loses-life", who: m[1] === "you lose" ? "you" : "opponent" }];
  }
  // The Theros Ordeals: however it's sacrificed (their ruling).
  if (/^When you sacrifice (?:~|this (?:Aura|enchantment|artifact|creature|permanent))$/.test(c)) {
    return [{ on: "sacrifice", who: "you", selfOnly: true }];
  }
  if ((m = /^Whenever you sacrifice (a|an|another) (.+)$/.exec(c))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null) return null;
    return [
      {
        on: "sacrifice",
        who: "you",
        // "a permanent" narrows nothing.
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
        ...(m[1] === "another" ? { otherOnly: true } : {}),
      },
    ];
  }
  if (/^Whenever you discard one or more cards$/.test(c)) return [{ on: "discards", who: "you" }];
  // The turn's first discard, read off its history (Rielle, the Everwise).
  if (/^Whenever you discard one or more cards for the first time each turn$/.test(c)) {
    return [{ on: "discards", who: "you", firstTimeEachTurn: true }];
  }
  // A trigger of the discarded card itself, from the zone the discard put
  // it in (rule 113.6k) — Titanbones; with the discard's cause an
  // opponent's spell or ability (Psychic Purge, Metrognome).
  if (/^When you discard (?:~|this card)$/.test(c)) return [{ on: "this-discarded" }];
  if (/^When a spell or ability an opponent controls causes you to discard (?:~|this card)$/.test(c)) {
    return [{ on: "this-discarded", byOpponent: true }];
  }
  if (/^Whenever a spell or ability an opponent controls causes you to discard a card$/.test(c)) {
    return [{ on: "discards", who: "you", byOpponent: true, perCard: true }];
  }
  if (/^Whenever you surveil$/.test(c)) return [{ on: "surveils", who: "you" }];

  // Steps.
  if (/^At the beginning of combat on your turn$/.test(c)) return [{ on: "step-begins", step: "begin-combat", who: "you" }];
  if (/^At the beginning of each combat$/.test(c)) return [{ on: "step-begins", step: "begin-combat", who: "any" }];
  if (/^At the beginning of combat on each opponent's turn$/.test(c)) return [{ on: "step-begins", step: "begin-combat", who: "opponent" }];
  // Super Intelligence: the step belongs to whoever controls the Aura's host.
  if (/^At the beginning of the upkeep of enchanted creature's controller$/.test(c)) return [{ on: "step-begins", step: "upkeep", who: "attached" }];
  // Every combat's end of combat step (rule 511): Kjeldoran Frostbeast.
  if (/^At end of combat$/.test(c)) return [{ on: "step-begins", step: "end-combat", who: "any" }];
  if (/^At end of combat on your turn$/.test(c)) return [{ on: "step-begins", step: "end-combat", who: "you" }];
  if ((m = /^At the beginning of (your|each of your|each|the|each opponent's|each player's|enchanted player's|the chosen player's) (upkeep|draw step|end step|precombat main phase|first main phase|postcombat main phases?)$/.exec(c))) {
    return [{ on: "step-begins", step: STEPS[m[2]], who: WHO_STEP[m[1]] }];
  }
  return null;
}

// --------------------------------------------------------------- effects

/**
 * One sentence of an effect as an `EffectSpec`, or `null`. `ctx.target(spec)`
 * allocates a target slot and returns its index; `ctx.tokenFor(desc)` names
 * the engine token a "create" means.
 */
/** "Other creatures you control" means other than the source only on a
 * permanent's ability that hasn't named a target: on a spell, or after "target
 * creature", the one it excludes is the target (Exhilarating Elocution). */
const otherMeansSource = (ctx) => !ctx.spell && ctx.targets.length === 0;

/** `parseSentence`'s whole-sentence template, `^…\.$` case-blind, compiled
 * once per source: building ~170 of them for every sentence was the parse
 * check's largest cost (4 of its 9 s, 2026-10-31). Safe to share: the flag
 * is only `i`, so a match keeps no `lastIndex` state. */
const sentenceReCache = new Map();
function sentenceRe(src) {
  let r = sentenceReCache.get(src);
  if (r === undefined) sentenceReCache.set(src, (r = new RegExp(`^${src}\\.$`, "i")));
  return r;
}

/**
 * A divided total that is read as the division is announced (rule 601.2d):
 * "the number of lands you control", "the number of creatures on the
 * battlefield", "the greatest power among creatures you control" (an
 * aggregate), "the number of age counters on it", "its power" — an
 * `EffectAmount`, or `null`.
 */
function dividedTotalOf(phrase) {
  let m;
  const agg = aggregatePhraseOf(phrase);
  if (agg !== null) return agg;
  if ((m = /^the number of (.+?) (you control|on the battlefield)$/.exec(phrase))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { countOf: m[2] === "you control" ? { ...filter, controlledBy: "you" } : filter };
  }
  if ((m = /^the number of ([a-z]+|[+-]\d\/[+-]\d) counters on (?:it|~)$/.exec(phrase))) {
    return { countersOn: "source", counter: m[1] };
  }
  if (/^(?:its|~'s) power$/.test(phrase)) return { powerOf: "source" };
  return null;
}

/**
 * "~ deals 3 damage divided as you choose among one, two, or three targets",
 * "it deals X damage divided as you choose among any number of target
 * creatures, where X is …", "~ deals damage equal to its power divided as
 * you choose among any number of targets" (rule 601.2d): a `damage-divided`
 * over the `any-number` group it adds, with `ctx.divided.value` set to the
 * spell's or ability's `divided`. `undefined` for any other sentence, `null`
 * for one of these it can't read. A fixed total caps the group as authored
 * (`max`); one read as it's announced caps it in the engine (no `max`); a
 * spell's bare X is `x: true` with the group `max: "x"` (Fire Covenant).
 */
function dividedDamageOf(s, ctx) {
  const m =
    /^(~|[Ii]t) deals (?:(a|an|one|two|three|four|five|six|seven|eight|nine|ten|X|\d+) damage|damage equal to (?:its|~'s) power) divided as you choose among (.+?)(?:, where X is (.+?))?\.$/.exec(
      s,
    );
  if (m === null) return undefined;
  // "It" is the ability's own source only while nothing is targeted yet.
  if (m[1] !== "~" && (ctx.it !== "source" || ctx.targets.length > 0)) return null;
  const [, , word, groupPhrase, where] = m;
  let total;
  let x = false;
  if (word === undefined) {
    if (where !== undefined) return null;
    total = { powerOf: "source" };
  } else if (word === "X") {
    if (where === undefined) {
      // A spell's own X (Fire Covenant); an ability's X is a person's.
      if (!ctx.spell) return null;
      x = true;
      total = 0;
    } else {
      // "… as you cast this spell" / "… as you activate this ability" says
      // when the division reads it, which is when the engine reads it.
      const phrase = where.replace(ctx.spell ? / as you cast (?:~|this spell)$/ : / as you activate this ability$/, "");
      total = dividedTotalOf(phrase);
      if (total === null) return null;
    }
  } else {
    if (where !== undefined) return null;
    total = numberOf(word.toLowerCase());
    if (typeof total !== "number") return null;
  }
  const fixed = typeof total === "number" && !x;
  let g;
  let of;
  let bounds;
  if ((g = /^(any number of|one or two|one, two, or three) (targets|target (.+))$/.exec(groupPhrase))) {
    if (g[3] === undefined) of = "any-target";
    else {
      const plural = g[3].replace(/ your opponents control$/, " an opponent controls");
      const either = /^creatures and\/or planeswalkers/;
      of = targetOf(`target ${either.test(plural) ? plural.replace(either, "creature or planeswalker") : singularTarget(plural)}`);
    }
    if (of === undefined) return null;
    if (g[1] === "any number of") {
      bounds = x ? { max: "x" } : fixed ? { max: total } : {};
    } else {
      // "One or two": a fixed total of at least the most targets.
      const most = g[1] === "one or two" ? 2 : 3;
      if (!fixed || total < most) return null;
      bounds = { min: 1, max: most };
    }
  } else return null;
  const slot = ctx.target({ kind: "any-number", of, ...bounds });
  ctx.divided.value = { total, slot, ...(x ? { x: true } : {}) };
  return { kind: "damage-divided", from: slot };
}

/**
 * Counters distributed with a total that is an amount. Among targets (rule
 * 601.2d): "distribute X +1/+1 counters among any number of target creatures
 * you control, where X is the number of +1/+1 counters on ~" (Quirion
 * Beastcaller, Undercity Upheaval) — a `counters-divided` over the
 * `any-number` group it adds, its total read as the division is announced
 * (`ctx.divided.value`). Among permanents chosen as it resolves (rule 608.2d):
 * "distribute X +1/+1 counters among any number of creatures you control,
 * where X is …" (Blessing of Frost), "distribute a number of +1/+1 counters
 * equal to the number of +1/+1 counters on ~ among any number of creatures
 * you control" (Vastwood Hydra) — a `counters-distributed`. `undefined` for
 * any other sentence, `null` for one of these it can't read.
 */
function distributedCountersOf(s, ctx) {
  const m =
    /^(?:~ |[Ii]t )?[Dd]istribute (?:X ([+-]\d+\/[+-]\d+|[a-z]+) counters|a number of ([+-]\d+\/[+-]\d+|[a-z]+) counters equal to (.+?)) among any number of (other )?(target )?(.+?)(?:, where X is (.+?))?\.$/.exec(s);
  if (m === null) return undefined;
  const [, xKind, eqKind, eqPhrase, other, targeted, plural, where] = m;
  const counter = (xKind ?? eqKind).toLowerCase();
  const phrase = xKind !== undefined ? where : eqPhrase;
  if (phrase === undefined || (xKind === undefined && where !== undefined)) return null;
  const read = ctx.spell ? phrase.replace(/ as you cast (?:~|this spell)$/, "") : phrase;
  let total = dividedTotalOf(read);
  if (total === null) {
    let g;
    if ((g = /^the number of (.+?) cards in your graveyard$/.exec(read))) {
      const filter = parseTypePhrase(g[1]);
      if (filter === null || Object.keys(filter).length === 0) return null;
      total = { countInGraveyard: { ...filter, ownedBy: "you" } };
    } else if (ctx.spell && /^the amount of \{S\} spent to cast (?:~|this spell)$/.test(read)) {
      total = { manaSpentOf: "source", from: { supertype: "snow" } };
    } else return null;
  }
  if (targeted !== undefined) {
    if (ctx.divided === undefined || xKind === undefined) return null;
    const single = `target ${singularTarget(plural.replace(/ your opponents control$/, " an opponent controls"))}`;
    const of = targetOf(single);
    if (of === undefined) return null;
    const slot = ctx.target({ kind: "any-number", of: other !== undefined ? { kind: "other", of } : of });
    ctx.divided.value = { total, slot, of: `${counter} counters` };
    return { kind: "counters-divided", from: slot, counter };
  }
  if (other !== undefined) return null;
  const own = / (you control|an opponent controls|your opponents control)$/.exec(plural);
  const filter = parseTypePhrase(own === null ? plural : plural.slice(0, own.index));
  if (filter === null || Object.keys(filter).length === 0) return null;
  return {
    kind: "counters-distributed",
    counter,
    total,
    filter: own === null ? filter : { ...filter, controlledBy: own[1] === "you control" ? "you" : "opponent" },
    among: plural,
  };
}

/**
 * What a "for each …" over this turn's events counts, the phrase alone:
 * Iridescent Hornbeetle's counters, Rose's opponents attacked, Smuggler's Share's
 * opponents past a threshold. `undefined` for any other phrase.
 */
function turnTallyOf(phrase) {
  const p = phrase.toLowerCase();
  if (p === "+1/+1 counter you've put on creatures under your control this turn") {
    return { countersPutThisTurn: { counter: "+1/+1", onType: "creature", onYours: true } };
  }
  if (p === "opponent you attacked" || p === "opponent you attacked this turn") return { turnStat: "opponents-attacked" };
  const each = (condition) => ({ countPlayers: "each-opponent", where: { kind: "of-player", player: "that-player", condition } });
  let m = /^opponent who drew (two|three|four|five) or more cards this turn$/.exec(p);
  if (m !== null) return each({ kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast: numberOf(m[1]) });
  m = /^opponent who had (two|three|four|five) or more lands enter the battlefield under their control this turn$/.exec(p);
  if (m !== null) return each({ kind: "turn-history", what: "entered", filter: { type: "land" }, atLeast: numberOf(m[1]) });
  return undefined;
}

/**
 * A sentence whose amount is read from this turn's events; `null` for any
 * other. Above the guard in `parseSentence` that leaves every other "for each"
 * and "equal to" to a person.
 */
function turnTallyEffect(s, ctx) {
  const capital = (text) => `${text[0].toUpperCase()}${text.slice(1)}`;
  // Wall of Mourning's, one instruction: a count, not an effect done for each.
  if (/^exile a card from the top of your library face down for each opponent you have\.$/i.test(s)) {
    return { kind: "exile-from-library", amount: { countPlayers: "each-opponent" }, faceDown: true, linked: true };
  }
  let m = /^(.+ for each .+ this turn), then (.+ for each .+ this turn)\.$/i.exec(s);
  if (m !== null) {
    const first = turnTallyEffect(`${m[1]}.`, ctx);
    const second = turnTallyEffect(`${capital(m[2])}.`, ctx);
    return first === null || second === null ? null : { kind: "sequence", effects: [first, second] };
  }
  m = /^(.+?) for each (.+)\.$/i.exec(s);
  if (m !== null) {
    const amount = turnTallyOf(m[2]);
    if (amount === undefined) return null;
    const base = parseSentence(`${capital(m[1])}.`, ctx);
    if (base?.kind === "create-token" && base.count === 1) return { ...base, count: amount };
    if (base?.kind === "draw" && base.amount === 1) return { ...base, amount };
    return null;
  }
  m = /^create a number of (.+?) tokens?( with .+?)? equal to the number of opponents you attacked this turn\.$/i.exec(s);
  if (m !== null) {
    const base = parseSentence(`Create a ${m[1]} token${m[2] ?? ""}.`, ctx);
    return base?.kind === "create-token" && base.count === 1 ? { ...base, count: { turnStat: "opponents-attacked" } } : null;
  }
  m = /^draw cards equal to the number of cards (target opponent|target player) discarded this turn\.$/i.exec(s);
  if (m !== null) {
    return { kind: "draw", amount: { turnHistory: "discarded", target: ctx.target(m[1].toLowerCase() === "target opponent" ? "opponent" : "player") } };
  }
  if (/^~ deals damage to each creature your opponents control equal to the total mana value of other spells you've cast this turn\.$/i.test(s)) {
    return {
      kind: "damage-all",
      filter: { type: "creature", controlledBy: "opponent" },
      amount: { castThisTurn: {}, total: "mana-value", other: true },
    };
  }
  if (/^each opponent loses life equal to the life they lost this turn\.$/i.test(s)) {
    return { kind: "lose-life", who: "each-opponent", amount: { turnStat: "life-lost", who: "each" } };
  }
  return null;
}

/**
 * A quoted static on an emblem (rule 114): any line `parseStatic` reads, and
 * those only an emblem says, for the whole of a player's game. `null` for
 * anything else, a triggered ability among them, so the line stays open.
 */
function emblemStaticOf(quoted) {
  const parsed = parseGrantedStatic(quoted);
  if (parsed !== null) return parsed;
  const text = quoted;
  if (quoted === "You may activate loyalty abilities of planeswalkers you control on any player's turn any time you could cast an instant.") {
    return { affects: { scope: "self" }, loyaltyAtInstantSpeed: true, text };
  }
  if (quoted === "Artifacts, creatures, enchantments, and lands you control have indestructible.") {
    return {
      affects: { scope: "filter", filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land"], controlledBy: "you" } },
      grantKeywords: ["indestructible"],
      text,
    };
  }
  if (quoted === "If a source would deal damage to you or a planeswalker you control, prevent all but 1 of that damage.") {
    return {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "your-side", toFilter: { type: "planeswalker" }, preventAllBut: 1 },
      text,
    };
  }
  if (quoted === "As long as you control a Gideon planeswalker, you can't lose the game and your opponents can't win the game.") {
    return {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Gideon" }, atLeast: 1 },
      cantLoseGame: true,
      opponentsCantWinGame: true,
      text,
    };
  }
  if (quoted === "You may cast instant and sorcery spells from your graveyard. If a spell cast this way would be put into your graveyard, exile it instead.") {
    return {
      affects: { scope: "self" },
      castFromGraveyard: { filter: { typesAnyOf: ["instant", "sorcery"] }, exileAfterwards: true },
      text,
    };
  }
  if (quoted === "You may cast spells from your hand without paying their mana costs.") {
    return { affects: { scope: "self" }, alternativeCostForSpells: { mana: "{0}", fromHand: true }, text };
  }
  if (quoted === "Your opponents can't cast noncreature spells.") {
    return { affects: { scope: "self" }, prohibits: { who: "opponents", spells: { notTypes: ["creature"] } }, text };
  }
  return null;
}

/** `You get an emblem with "…" [and "…"]`: every quoted ability a static. */
function emblemOf(s) {
  const whole = /^You get an emblem with "(.+?)\.?"(?: and "(.+?)\.?")?\.?$/.exec(s);
  if (whole === null) return null;
  const quoted = [whole[1], whole[2]].filter((q) => q !== undefined).map((q) => `${q}.`);
  const statics = quoted.map(emblemStaticOf);
  if (statics.some((a) => a === null)) return null;
  const [first, ...more] = statics;
  return {
    kind: "create-emblem",
    text: quoted.join(" "),
    static: first,
    ...(more.length > 0 ? { moreStatics: more } : {}),
  };
}

/** A point in a later turn (`UntilPointDuration`) as Oracle text words it. */
const LATER_POINTS = [
  [/until your next upkeep/i, "until-your-next-upkeep"],
  [/until the end of your next upkeep/i, "until-end-of-your-next-upkeep"],
  [/until the end of your next turn/i, "until-end-of-your-next-turn"],
  [/until its controller's next untap step/i, "until-its-controllers-next-untap-step"],
];

/** The effect kinds whose `duration` is a `PtDuration`. */
const PT_DURATION_KINDS = new Set(
  "add-types animate animate-all become-color block-additional cant-be-sacrificed change-text double-pt-all grant-activated grant-activated-all grant-keyword grant-keyword-all grant-protection grant-static grant-toxic grant-triggered grant-triggered-all lose-abilities lose-abilities-all lose-keywords modify-pt modify-pt-all switch-pt".split(
    " ",
  ),
);

/** `effect`, an "until end of turn" one, lasting `duration` instead, or `null`
 * for anything that doesn't take one. */
function lastingUntil(effect, duration) {
  if (effect === null || typeof effect !== "object") return null;
  if (effect.kind === "gain-control" && effect.untilEndOfTurn === true) {
    return { ...effect, untilEndOfTurn: false, until: duration };
  }
  if (effect.kind === "sequence") {
    const effects = effect.effects.map((e) => lastingUntil(e, duration));
    return effects.includes(null) ? null : { ...effect, effects };
  }
  return PT_DURATION_KINDS.has(effect.kind) && effect.duration === "end-of-turn" ? { ...effect, duration } : null;
}

/** "Target land becomes a Swamp until its controller's next untap step": the
 * sentence's "until end of turn" reading, lasting that long instead; `null`
 * when it has no such reading, with nothing left in `ctx`. */
function laterPointSentence(s, ctx) {
  const later = LATER_POINTS.find(([words]) => words.test(s));
  if (later === undefined) return null;
  const slots = ctx.targets.length;
  // "Until your next upkeep, target …" as "Target … until end of turn".
  const leading = new RegExp(`^${later[0].source}, (.+?)\\.?$`, "i").exec(s);
  const asThisTurn =
    leading !== null
      ? `${leading[1][0].toUpperCase()}${leading[1].slice(1)} until end of turn.`
      : s.replace(later[0], "until end of turn");
  const read = parseSentence(asThisTurn, ctx);
  const effect = lastingUntil(read, later[1]);
  if (effect === null) ctx.targets.length = slots;
  return effect;
}

export function parseSentence(sentence, ctx) {
  const s = sentence.replace(/\s+/g, " ").trim();
  const emblem = emblemOf(s);
  if (emblem !== null) return emblem;
  // Fall from Favor's enters trigger, the two things at once.
  if (/^tap enchanted creature and you become the monarch\.$/i.test(s)) {
    return { kind: "sequence", effects: [{ kind: "tap", target: "attached" }, { kind: "become-monarch" }] };
  }
  // Stasis Cell, Detainment Spell: the Aura moved.
  if (/^attach ~ to target creature\.$/i.test(s)) {
    return { kind: "attach", target: ctx.target("creature") };
  }
  // Getaway Glamer: about the target as it resolves, a tie destroying it.
  if (/^destroy target creature if no other creature has greater power\.$/i.test(s)) {
    const target = ctx.target("creature");
    return {
      kind: "conditional",
      condition: { kind: "target", index: target, filter: { greatestInZone: GREATEST_POWER_HERE.greatestInZone } },
      then: { kind: "destroy", target },
    };
  }
  const atLaterPoint = laterPointSentence(s, ctx);
  if (atLaterPoint !== null) return atLaterPoint;
  // "When you lose control of the creature, tap it" (Ray of Command), "… of
  // that Equipment, unattach it" (Ogre Geargrabber): a delayed ability about
  // the one target (rule 603.10d).
  const losing = /^When you lose control of (?:the (?:creature|artifact)|that (?:creature|artifact|Equipment)), (tap|unattach) it\.$/.exec(s);
  if (losing !== null && ctx.targets.length === 1) {
    return {
      kind: "delayed-trigger",
      at: { losesControl: 0 },
      effect: { kind: losing[1], target: 0 },
      text: s,
    };
  }
  // "~ deals 2 damage to any target and doesn't untap during your next untap
  // step" (Reveka), "~ gains shroud until end of turn and doesn't untap …"
  // (Deep Spawn): the action, then the hold on the source.
  const andHeld = /^(~ .+?) and (doesn't untap during (?:your|its controller's) next (?:two )?untap steps?)\.?$/i.exec(s);
  if (andHeld !== null) {
    const first = parseSentence(`${andHeld[1]}.`, ctx);
    const held = parseSentence(`~ ${andHeld[2]}.`, ctx);
    if (first !== null && first !== undefined && held !== null && held !== undefined) {
      return { kind: "sequence", effects: [first, held] };
    }
  }
  // "Destroy target creature if it shares a color with the most common color
  // among all permanents or a color tied for most common" (Tsabo's Assassin,
  // Barrin's Unmaking): rule 105.2, read as the slot's target stands.
  const sharesMostCommon =
    /^(.+target .+?) if (?:it|that permanent|that creature) shares a color with the most common color among all permanents or a color tied for most common\.$/.exec(s);
  if (sharesMostCommon !== null) {
    const then = parseSentence(`${sharesMostCommon[1]}.`, ctx);
    if (then !== null && then !== undefined) {
      return { kind: "conditional", condition: { kind: "most-common-color", sharedBy: { target: 0 } }, then };
    }
  }
  // "…, where X is the number of …" / "for each …" define an amount by a rule
  // of their own; no template reads one, and matching the rest would take the
  // X for a cast-time X.
  // The one exception: "for each … counter removed this way", which is the
  // cost's X (`removeCounter.count: "x"`), read by the mana templates below.
  let m;
  // "… to target player or planeswalker and each creature that player or that
  // planeswalker's controller controls" (Bonfire of the Damned, Lavalanche),
  // ahead of the plain "~ deals N damage to target …".
  if ((m = sentenceRe(`~ deals ${N} damage to target player or planeswalker and each creature that player or that planeswalker's controller controls`).exec(s))) {
    const first = ctx.target("player-or-planeswalker");
    const n = numberOf(m[1]);
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: n, target: first },
        { kind: "damage-all", filter: { type: "creature" }, amount: n, controlledByTarget: first },
      ],
    };
  }
  // "Investigate once for each opponent who has more cards in hand than you"
  // (Wojek Investigator): a count of the players it holds for.
  if ((m = /^investigate once for each opponent who has more (cards in hand|life) than you\.$/i.exec(s))) {
    const where = { kind: "player-compare", stat: COMPARED_STATS[m[1].toLowerCase()], compare: "fewer", than: "that-player" };
    return { kind: "create-token", token: "Clue Token", count: { countPlayers: "each-opponent", where } };
  }
  const tallied = turnTallyEffect(s, ctx);
  if (tallied !== null) return tallied;
  // A cost to attack for a while (the `attackTax` player effect, rule 508.1h),
  // whose "for each" is per creature, not an amount: "Until your next turn,
  // creatures can't attack you or planeswalkers you control unless their
  // controller pays {2} / 2 life for each of those creatures" (Forbidding
  // Spirit, Sivitri), and "This turn, creatures can't attack unless their
  // controller pays {X} for each attacking creature they control" (War Tax).
  if ((m = /^until your next turn, creatures can't attack (you|you or planeswalkers you control) unless their controller pays (?:\{(\d+)\}|(\d+) life) for each of those creatures\.$/i.exec(s))) {
    return {
      kind: "player-effect",
      duration: "until-your-next-turn",
      attackTax: {
        ...(m[2] !== undefined ? { generic: Number(m[2]) } : { life: Number(m[3]) }),
        ...(m[1] === "you" ? {} : { covers: "you-and-planeswalkers" }),
      },
    };
  }
  if (/^this turn, creatures can't attack unless their controller pays \{X\} for each attacking creature they control\.$/i.test(s)) {
    return { kind: "player-effect", duration: "end-of-turn", attackTax: { generic: "x", covers: "all" } };
  }
  // A becomes-target trigger's "counter that spell or ability unless its
  // controller pays {N}" (Frost Titan, Unsettled Mariner): ward's counter of
  // the targeting spell or ability (rule 702.21a's shape).
  if ((m = /^counter that spell or ability unless its controller pays (\{\d+\})\.$/i.exec(s))) {
    return { kind: "ward", cost: { mana: m[1] } };
  }
  // "Until end of turn, if you tap a land you control for mana, it produces
  // {U} instead of any other type" (Deep Water — rule 106.12).
  if ((m = /^until end of turn, if you tap a land you control for mana, it produces \{([WUBRGC])\} instead of any other type\.$/i.exec(s))) {
    return { kind: "player-effect", duration: "end-of-turn", landManaInstead: m[1] };
  }
  // "Until your next turn, creatures can't attack you" (Chronomantic Escape):
  // a rule for a while, no cost.
  if (/^until your next turn, creatures can't attack you\.$/i.test(s)) {
    return { kind: "player-effect", duration: "until-your-next-turn", cantAttack: "you" };
  }
  // Its block twin (War Cadence, rule 509.1d).
  if (/^this turn, creatures can't block unless their controller pays \{X\} for each blocking creature they control\.$/i.test(s)) {
    return { kind: "player-effect", duration: "end-of-turn", blockTax: { generic: "x" } };
  }
  // An `unless`'s life by the target's toughness (Essence Vortex): its "equal
  // to" is the option's amount, which the amount guard below would refuse.
  if (/^destroy target creature unless its controller pays life equal to its toughness\.$/i.test(s)) {
    const i = ctx.target(targetOf("target creature"));
    return {
      kind: "unless",
      chooser: i,
      options: [{ payLifeAmount: { toughnessOf: i }, text: "Pay {X} life" }],
      otherwise: { kind: "destroy", target: i },
    };
  }
  // A meld card's "If you both own and control ~ and a creature named
  // Hanweir Garrison, exile them, then meld them into Hanweir, the Writhing
  // Township." (rule 701.42 — the `meld` effect, which makes the test).
  if ((m = MELD_SENTENCE.exec(s))) {
    return { kind: "meld", partner: { name: m[2], type: m[1].toLowerCase() }, into: m[3] };
  }
  // "Draw a card for each different mana value among nonland permanents you
  // control" (Lunar Insight), "… different power among creatures you
  // control" (Golden Ratio): a `distinct` aggregate.
  if ((m = /^draw a card for each different (mana value|power) among (.+?) you control\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    const of = m[1].toLowerCase() === "power" ? "power" : "mana-value";
    return { kind: "draw", amount: { aggregate: "distinct", of, filter: { ...filter, controlledBy: "you" } } };
  }
  // The turn history's graveyard tallies: "draw a card for each card you've
  // discarded this turn" (Change of Fortune, Misty Knight), "cards that were
  // put into target player's graveyard from their library this turn" (Cruel
  // Calculations).
  const discardedDraw = { kind: "draw", amount: { turnHistory: "discarded" } };
  if (/^(?:then )?draw a card for each card you've discarded this turn\.$/i.test(s)) return discardedDraw;
  if (/^discard your hand, then draw a card for each card you've discarded this turn\.$/i.test(s)) {
    return { kind: "sequence", effects: [{ kind: "discard-hand", who: "you" }, discardedDraw] };
  }
  if ((m = /^draw X cards, where X is the number of cards that were put into (your|target player's) graveyard from (?:your|their) library this turn\.$/i.exec(s))) {
    const whose = m[1].toLowerCase() === "your" ? {} : { target: ctx.target("player") };
    return { kind: "draw", amount: { turnHistory: "to-graveyard", ...whose, from: ["library"] } };
  }
  // "All cards in your graveyard that you cycled or discarded this turn"
  // (Shadow of the Grave): cycling is discarding (rule 702.29a).
  if (/^return to your hand all cards in your graveyard that you (?:cycled or )?discarded this turn\.$/i.test(s)) {
    return { kind: "return-from-graveyard", filter: { discardedThisTurn: true }, destination: "hand", count: "all" };
  }
  // "Return to the battlefield all permanent cards in your graveyard that
  // were put there from the battlefield this turn" (Faith's Reward), "return
  // to your hand all creature cards …" (Gleancrawler), "each player returns
  // to the battlefield all artifact, creature, enchantment, and land cards in
  // their graveyard …" (Second Sunrise), "return to your hand all cards …"
  // (Twilight Shepherd), "put onto the battlefield under your control all
  // creature cards in all graveyards …" (Thrilling Encore). "Under your
  // control" over one graveyard of yours says nothing more.
  if ((m = /^(return|each player returns|put) (to the battlefield|to your hand|onto the battlefield under your control) all (?:(.+?) )?cards in (your|their|all) graveyards? that were put there from the battlefield this turn\.$/i.exec(s))) {
    const [verb, where, whose] = [m[1].toLowerCase(), m[2].toLowerCase(), m[4].toLowerCase()];
    const from =
      verb === "each player returns" && whose === "their" && where === "to the battlefield"
        ? "each-graveyard"
        : verb === "put" && whose === "all" && where === "onto the battlefield under your control"
          ? "all-graveyards"
          : verb === "return" && whose === "your" && where !== "onto the battlefield under your control"
            ? undefined
            : null;
    const types = m[3] === undefined ? {} : graveyardReturnTypes(m[3]);
    if (from !== null && types !== null) {
      return {
        kind: "return-from-graveyard",
        ...(from !== undefined ? { from } : {}),
        filter: { ...types, putIntoGraveyardThisTurn: { from: ["battlefield"] } },
        destination: where === "to your hand" ? "hand" : "battlefield",
        count: "all",
      };
    }
  }
  // Every graveyard at once, with no "this turn": "return all artifact and
  // enchantment cards from all graveyards to the battlefield under their
  // owners' control" (Open the Vaults), "… to the battlefield tapped …"
  // (Planar Birth); "each player returns each creature card from their
  // graveyard to the battlefield with an additional -1/-1 counter on it"
  // (Pyrrhic Revival); "return all Zombie cards from all graveyards to their
  // owners' hands" (Infernal Caretaker).
  if ((m = /^return all (.+?) cards from all graveyards to (the battlefield( tapped)? under their owners' control|their owners' hands)\.$/i.exec(s))) {
    const types = graveyardReturnTypes(m[1]);
    if (types !== null) {
      const toHand = /hands$/i.test(m[2]);
      return {
        kind: "return-from-graveyard",
        from: toHand ? "all-graveyards" : "each-graveyard",
        filter: types,
        destination: toHand ? "hand" : "battlefield",
        ...(m[3] !== undefined ? { enterTapped: true } : {}),
        count: "all",
      };
    }
  }
  if ((m = /^each player returns (?:all|each) (.+?) cards? from their graveyard to the battlefield(?: with an additional (-1\/-1|\+1\/\+1) counter on it)?\.$/i.exec(s))) {
    const types = graveyardReturnTypes(m[1]);
    if (types !== null) {
      return {
        kind: "return-from-graveyard",
        from: "each-graveyard",
        filter: types,
        destination: "battlefield",
        ...(m[2] !== undefined ? { withCounters: { kind: m[2], amount: 1 } } : {}),
        count: "all",
      };
    }
  }
  // What a `remove-counters` just before took off, counted one by one:
  // "For each counter removed this way, ~ gets +1/+0 until end of turn" (Hex
  // Parasite), "You draw cards and lose life equal to the number of counters
  // removed this way" (Eventide's Shadow).
  const removedThisWay = { thisWay: "counters-removed" };
  // A "remove all … counters" cost's number is the ability's X.
  if (ctx?.removedIsX === true && (m = /^you gain (\d+) life for each [\w+/-]+ counter removed this way\.$/i.exec(s))) {
    return { kind: "gain-life", amount: { product: ["x", Number(m[1])] } };
  }
  if (ctx?.removedIsX === true && /^target creature gets -1\/-1 until end of turn for each [\w+/-]+ counter removed this way\.$/i.test(s)) {
    const slot = ctx.target("creature");
    const less = { product: ["x", -1] };
    return { kind: "modify-pt", target: slot, power: less, toughness: less, duration: "end-of-turn" };
  }
  if ((m = /^for each counter removed this way, ~ gets \+1\/\+(0|1) until end of turn\.$/i.exec(s))) {
    return {
      kind: "modify-pt",
      target: "source",
      power: removedThisWay,
      toughness: m[1] === "1" ? removedThisWay : 0,
      duration: "end-of-turn",
    };
  }
  // "For each attacking creature, its owner puts it on their choice of the
  // top or bottom of their library" (Aetherspouts): no amount — the owners'
  // choices, then the moves together (`put-on-libraries`, rule 401.4).
  if (/^for each attacking creature, its owner puts it on their choice of the top or bottom of their library\.$/i.test(s)) {
    return { kind: "put-on-libraries", what: { all: { type: "creature", attacking: true } }, position: "owner-chooses" };
  }
  if (/^you draw cards and lose life equal to the number of counters removed this way\.$/i.test(s)) {
    return {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: removedThisWay },
        { kind: "lose-life", amount: removedThisWay },
      ],
    };
  }
  // "~ deals 5 damage divided as you choose among any number of targets"
  // (rule 601.2d), and a total read as the division is announced — "X
  // damage …, where X is the number of lands you control", "damage equal to
  // its power …": a `damage-divided` over an `any-number` group, the
  // ability's or spell's `divided` set through `ctx.divided`. Ahead of the
  // "where X" guard below, since it reads its own X.
  if (ctx?.divided !== undefined) {
    const d = dividedDamageOf(s, ctx);
    if (d !== undefined) return d;
    // "Prevent the next 5 damage that would be dealt this turn to any number
    // of targets, divided as you choose" (Remedy — rules 601.2d, 615.7): a
    // shield per target of an `any-number` group, its share of the total.
    const p = /^Prevent the next (a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+) damage that would be dealt this turn to any number of targets, divided as you choose\.$/.exec(s);
    if (p !== null) {
      const total = numberOf(p[1].toLowerCase());
      if (typeof total === "number") {
        const slot = ctx.target({ kind: "any-number", of: "any-target", max: total });
        ctx.divided.value = { total, slot, of: "damage to prevent" };
        return { kind: "prevent-damage-divided", from: slot };
      }
    }
  }
  // Counters distributed by an amount, among targets or among permanents
  // chosen as it resolves (`distributedCountersOf`) — also ahead of the guard.
  {
    const d = distributedCountersOf(s, ctx ?? {});
    if (d !== undefined) return d;
  }
  // "Where X is the discarded card's mana value" where a "discard a card"
  // cost discarded it: the `"discarded"` amount ref (Volrath the Fallen) —
  // ahead of the guard too.
  if (ctx?.costDiscarded === true && /^~ gets \+X\/\+X until end of turn, where X is the discarded card's mana value\.$/.test(s)) {
    const ofDiscarded = { manaValueOf: "discarded" };
    return { kind: "modify-pt", target: "source", power: ofDiscarded, toughness: ofDiscarded, duration: "end-of-turn" };
  }
  // "The revealed card's mana value / power" where a "reveal a … card from
  // your hand" cost revealed it: the `"revealed"` amount ref — ahead of the
  // guard too.
  if (ctx?.costRevealed === true) {
    const r = revealedCardEffectOf(s, ctx);
    if (r !== undefined) return r;
  }
  // "Damage equal to the exiled card's power" where the cost exiled it from a
  // graveyard (Corpse Explosion): the `"exiled-as-cost"` amount ref.
  if (ctx?.costExiled === true && /^~ deals damage equal to the exiled card's power to each creature and each planeswalker\.$/.test(s)) {
    return {
      kind: "damage-all",
      filter: { typesAnyOf: ["creature", "planeswalker"] },
      amount: { powerOf: "exiled-as-cost" },
    };
  }
  // "Rather than pay the mana cost of the next spell you cast this turn, you
  // may pay life equal to that spell's mana value" (Marshland Bloodcaster).
  if (/^rather than pay the mana cost of the next spell you cast this turn, you may pay life equal to that spell's mana value\.$/i.test(s)) {
    return { kind: "grant-spells-this-turn", next: true, payLifeManaValue: true };
  }
  // A cost reduction on the next matching spell (`grant-spells-this-turn`'s
  // `reduceGeneric`), ahead of the guard for its X: "the next spell you cast
  // this turn costs {1} less to cast" (Hardened Berserker), "… {X} less to
  // cast, where X is the number of Wizards you control as this ability
  // resolves" (Kaza) — read then, so a live amount is fine.
  if ((m = /^the next (?:(.+?) )?spell you cast this turn costs \{(\d+|X)\} less to cast(?:, where X is (.+?) as this ability resolves)?\.$/i.exec(s))) {
    const filter = flashSpellsFilter(m[1]);
    const amt = m[2] === "X" ? (m[3] === undefined ? null : dividedTotalOf(m[3])) : m[3] === undefined ? Number(m[2]) : null;
    if (filter !== null && amt !== null) {
      return { kind: "grant-spells-this-turn", next: true, ...(filter === true ? {} : { filter }), reduceGeneric: amt };
    }
  }
  // The loop over each kind of counter on one thing: "for each kind of counter
  // on target permanent or player, give that permanent or player another
  // counter of that kind" (Powerful Broker), "…put another counter of that kind
  // on it or remove one from it" (Quarry Hauler).
  {
    const eachKind = sentenceRe(
      `for each kind of counter on (${TARGET}), (?:give that (?:permanent or player|permanent|creature) another counter of that kind|(put another counter of that kind on it or remove one from it))`,
    ).exec(s);
    const spec = eachKind === null ? undefined : targetOf(eachKind[1]);
    if (spec !== undefined) {
      return {
        kind: "another-counter-of-each-kind",
        target: ctx.target(spec),
        ...(eachKind[2] !== undefined ? { orRemove: true } : {}),
      };
    }
  }
  if (
    /\bwhere X\b|\bfor each\b/i.test(s) &&
    !/^add .*for each [\w+/-]+ counter removed this way\.$/i.test(s) &&
    !/ for each creature (?:blocking it|it's blocking)\.$/i.test(s)
  ) {
    return null;
  }
  // "Until end of turn, whenever …, …", "whenever … this turn, …" and "until
  // your next turn, whenever …, …" (rule 603.7c): a delayed triggered
  // ability with a duration. Its effect is read as a printed trigger's is —
  // "it" its trigger object — and any target it names is its own, chosen as
  // it triggers.
  if (
    (m = /^(Until end of turn|Until your next turn), (whenever [^,]+), (.+)\.$/i.exec(s)) ||
    (m = /^()(Whenever [^,]+) this turn, (.+)\.$/.exec(s))
  ) {
    const clause = m[2].charAt(0).toUpperCase() + m[2].slice(1);
    // "Whenever target creature deals damage this turn" (Paladin of Prahv): the
    // creating ability's own target is `watching`, what "self" in the trigger
    // reads as.
    const named = /^Whenever target creature /.test(clause);
    const triggers = parseTrigger(named ? clause.replace("target creature", "~") : clause);
    if (triggers === null || triggers.length !== 1) return null;
    if (named && triggers[0].who !== "self") return null;
    const inner = { ...ctx, spell: false, targets: [], it: itOf(triggers), departed: departedOf(triggers) };
    inner.target = (spec) => inner.targets.push(spec) - 1;
    const effectText = `${m[3].charAt(0).toUpperCase()}${m[3].slice(1)}.`;
    const effect =
      named && effectText === "You gain that much life."
        ? { kind: "gain-life", amount: { triggerValue: true } }
        : parseSentence(effectText, inner);
    if (effect === null || containsUndefined(effect)) return null;
    return {
      kind: "delayed-trigger",
      at: {
        whenever: triggers[0],
        ...(/^until your next turn$/i.test(m[1]) ? { until: "your-next-turn" } : {}),
        ...(inner.targets.length > 0 ? { targets: inner.targets } : {}),
        ...(named ? { watching: ctx.target("creature") } : {}),
      },
      effect,
      text: `${clause}${m[1] === "" ? " this turn" : ""}, ${m[3]}.`,
    };
  }
  // Adapt N (rule 701.46a): "If this permanent has no +1/+1 counters on it,
  // put N +1/+1 counters on it."
  if ((m = /^Adapt (\d+)\.$/.exec(s))) {
    return {
      kind: "conditional",
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
      then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: Number(m[1]) },
    };
  }
  const re = sentenceRe;
  const amount = (w) => numberOf(w);
  const slot = (phrase) => {
    const spec = targetOf(phrase) ?? graveyardTargetOf(phrase);
    return spec === undefined ? undefined : ctx.target(spec);
  };

  // "Damage … equal to the discarded card's mana value" where a "discard a
  // card" cost discarded it (Mercurial Chemister, Pyromancy).
  if (ctx?.costDiscarded === true) {
    const MV = "(?:the discarded card's mana value|the mana value of the discarded card)";
    if ((m = re(`~ deals damage to (${TARGET}) equal to ${MV}`).exec(s))) {
      return { kind: "damage", amount: { manaValueOf: "discarded" }, target: slot(m[1]) };
    }
  }

  // A card in exile, targeted (rule 406): into its owner's graveyard, or back
  // to a hand.
  if ((m = re(`put (${EXILE_TARGET}) into its owner's graveyard`).exec(s))) {
    const spec = exileTargetOf(m[1]);
    if (spec !== undefined) return { kind: "put-into-graveyard", target: ctx.target(spec) };
  }
  if ((m = re(`return (${EXILE_TARGET}) to (?:your|its owner's) hand`).exec(s))) {
    const spec = exileTargetOf(m[1]);
    if (spec !== undefined) return { kind: "return-to-hand", target: ctx.target(spec), from: "exile" };
  }

  // Cards.
  if ((m = re(`(?:you )?draw ${N} cards?`).exec(s))) return { kind: "draw", amount: amount(m[1]) };
  if ((m = re(`(target player|target opponent) draws ${N} cards?`).exec(s))) {
    return { kind: "draw", amount: amount(m[2]), target: slot(m[1]) };
  }
  if ((m = re(`each player draws ${N} cards?`).exec(s))) return { kind: "draw", amount: amount(m[1]), who: "each-player" };
  // "Each player shuffles their hand and graveyard into their library" (rule
  // 701.24a): the zones named, all in one move; "the cards from their hand
  // …, then draws that many cards" draws back what each put in.
  if (
    (m = re(
      `(each player shuffles|shuffle) (?:the cards from )?(?:their|your) (hand and graveyard|hand, graveyard, and all permanents (?:they|you) own|hand|graveyard) into (?:their|your) library(, then draws? that many cards)?(?:, then draws? ${N} cards)?`,
    ).exec(s))
  ) {
    const zones = { "hand and graveyard": ["hand", "graveyard"], hand: ["hand"], graveyard: ["graveyard"] }[m[2].toLowerCase()] ??
      ["hand", "graveyard", "permanents"];
    const who = m[1].toLowerCase() === "shuffle" ? "you" : "each-player";
    const shuffle = {
      kind: "shuffle-graveyard-into-library",
      target: who,
      ...(zones.length === 1 && zones[0] === "graveyard" ? {} : { zones }),
      ...(m[3] !== undefined ? { drawThatMany: true } : {}),
    };
    if (m[4] === undefined) return shuffle;
    const draw = { kind: "draw", amount: amount(m[4]), ...(who === "you" ? {} : { who }) };
    return { kind: "sequence", effects: [shuffle, draw] };
  }
  // "Shuffle all creature cards from your graveyard into your library"
  // (Barishi), "… nonland cards …" (Elixir), "… from target player's
  // graveyard into that player's library" (Repopulate): only the matching
  // cards, the library shuffled either way.
  if ((m = /^shuffle all (.+?) cards from (your|target player's|target opponent's) graveyard into (?:your|that player's) library\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    const yours = m[2].toLowerCase() === "your";
    if (filter !== null && Object.keys(filter).length > 0) {
      const target = yours ? "you" : slot(m[2].replace(/'s$/, ""));
      return { kind: "shuffle-graveyard-into-library", target, filter };
    }
  }
  if (/^shuffle all cards from your graveyard into your library\.$/i.test(s)) {
    return { kind: "shuffle-graveyard-into-library", target: "you" };
  }
  if (/^you gain life equal to the number of cards shuffled into your library this way\.$/i.test(s)) {
    return { kind: "gain-life", amount: { thisWay: "shuffled-into-library" } };
  }
  // "Shuffle ~ and up to three target cards from a single graveyard into
  // their owners' libraries" (Serene Remembrance): the spell goes too, and
  // each library a card went into is shuffled.
  if ((m = /^shuffle ~ and (.+? target .+?) into their owners' libraries\.$/i.exec(s))) {
    const got = quantifiedSlots(m[1], ctx);
    if (got !== undefined) {
      return { kind: "put-on-libraries", what: { targetsFrom: got.slots[0] }, position: "shuffle", withSource: true };
    }
  }
  // Controlling a player (rule 723): the next turn they actually take, or their
  // next combat phase.
  if ((m = re(`you control (target player|target opponent) during (?:that player's|their) next turn`).exec(s))) {
    return { kind: "control-player", target: slot(m[1]) };
  }
  if ((m = re(`you control (target player|target opponent) during (?:that player's|their) next combat phase`).exec(s))) {
    return { kind: "control-player", target: slot(m[1]), during: "next-combat" };
  }
  // Who chooses the attackers and the blocks, for the rest of the turn.
  if (re(`you choose which creatures attack this turn`).test(s)) return { kind: "choose-combat", attackers: true };
  if (re(`you choose which creatures block this turn and how those creatures block`).test(s)) {
    return { kind: "choose-combat", blocks: "all" };
  }
  if (re(`creatures your opponents control block this turn if able, and you choose how those creatures block`).test(s)) {
    return { kind: "choose-combat", blocks: "opponents", blockIfAble: true };
  }
  // A rule for the turn over the blockers (rule 611.2c), not over who's there now.
  if ((m = re(`each creature( your opponents control)? blocks this turn if able`).exec(s))) {
    return { kind: "block-if-able", filter: { type: "creature", ...(m[1] !== undefined ? { controlledBy: "opponent" } : {}) } };
  }
  if ((m = re(`all creatures your opponents control able to block (~|${TARGET}) this turn do so`).exec(s))) {
    return {
      kind: "block-if-able",
      filter: { type: "creature", controlledBy: "opponent" },
      attacker: m[1] === "~" ? "source" : slot(m[1]),
    };
  }
  // "Skips their next untap step" (rule 614.10): the whole step.
  if (re(`you skip your next untap step`).test(s)) return { kind: "skip-untap-step", who: "you" };
  if (re(`each opponent skips their next untap step`).test(s)) return { kind: "skip-untap-step", who: "each-opponent" };
  if ((m = re(`(target player|target opponent) skips their next untap step`).exec(s))) {
    return { kind: "skip-untap-step", who: slot(m[1]) };
  }
  // "Skips their next draw step" / upkeep step: the `skip-step` effect.
  if ((m = re(`you skip your next (draw|upkeep) step`).exec(s))) return { kind: "skip-step", step: m[1], who: "you" };
  if ((m = re(`each opponent skips their next (draw|upkeep) step`).exec(s))) {
    return { kind: "skip-step", step: m[1], who: "each-opponent" };
  }
  if ((m = re(`(target player|target opponent) skips their next (draw|upkeep) step`).exec(s))) {
    return { kind: "skip-step", step: m[2], who: slot(m[1]) };
  }
  // A whole combat phase, by the same effect: "skips their next combat phase",
  // "… this turn" (Moment of Silence), "all combat phases of their next turn".
  if ((m = re(`(target player|target opponent) skips their next combat phase( this turn)?`).exec(s))) {
    return { kind: "skip-step", step: "combat", who: slot(m[1]), ...(m[2] !== undefined ? { thisTurn: true } : {}) };
  }
  if ((m = re(`(target player|target opponent) skips all combat phases of their next turn`).exec(s))) {
    return { kind: "skip-step", step: "combat", who: slot(m[1]), allOfNextTurn: true };
  }
  if (ctx?.thatPlayer === "trigger-player" && re(`that player skips their next combat phase`).test(s)) {
    return { kind: "skip-step", step: "combat", who: "trigger-player" };
  }
  // "You skip your next turn" (rule 614.10), a turn in any seat's rotation or
  // an extra one: the `skip-turn` effect, with how many.
  if ((m = re(`(?:you )?skip your next (?:(${N}) )?turns?`).exec(s))) {
    return { kind: "skip-turn", who: "you", ...(m[1] !== undefined ? { count: amount(m[1]) } : {}) };
  }
  if ((m = re(`each opponent skips their next (?:(${N}) )?turns?`).exec(s))) {
    return { kind: "skip-turn", who: "each-opponent", ...(m[1] !== undefined ? { count: amount(m[1]) } : {}) };
  }
  if ((m = re(`(target player|target opponent) skips their next (?:(${N}) )?turns?`).exec(s))) {
    return { kind: "skip-turn", who: slot(m[1]), ...(m[2] !== undefined ? { count: amount(m[2]) } : {}) };
  }
  // A limit on one player's blockers for one combat (`limit-blockers`).
  if ((m = re(`each opponent can't block with more than (one|two|three) creatures? this combat`).exec(s))) {
    return { kind: "limit-blockers", who: "each-opponent", most: { one: 1, two: 2, three: 3 }[m[1]] };
  }
  // "End the turn" and "end the combat phase" (rule 724); "the player whose
  // turn it is may end the turn" asks them (Obeka, Brute Chronologist).
  if (re(`end the turn`).test(s)) return { kind: "end-the-turn" };
  if (re(`if it's your turn, end the turn`).test(s)) {
    return { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "end-the-turn" } };
  }
  if (re(`end the combat phase`).test(s)) return { kind: "end-the-combat-phase" };
  if (re(`the player whose turn it is may end the turn`).test(s)) {
    return { kind: "each-player-may", who: "active-player", prompt: "End the turn?", effect: { kind: "end-the-turn" } };
  }
  // "Take an extra turn after this one" (rule 500.7). What's said about that
  // turn is `extraTurnScopeAt`'s.
  if (re(`(?:you )?take an extra turn after this one`).test(s)) return { kind: "take-extra-turn" };
  if ((m = re(`(target player|target opponent) takes an extra turn after this one`).exec(s))) {
    return { kind: "take-extra-turn", target: slot(m[1]) };
  }
  if ((m = re(`draw ${N} cards?, then discard ${N} cards?`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: amount(m[1]) },
        { kind: "discard", target: "you", amount: amount(m[2]) },
      ],
    };
  }
  if ((m = re(`discard ${N} cards?`).exec(s))) return { kind: "discard", target: "you", amount: amount(m[1]) };
  // "Discard a land card" (Pack Guardian), "discard any number of creature
  // cards" (Mind Maggots): a discard limited to the cards a filter names.
  if ((m = re(`discard an? (.+?) card`).exec(s))) {
    const filter = discardFilterOf(m[1]);
    if (filter !== null) return { kind: "discard", target: "you", amount: 1, filter };
  }
  if ((m = re(`discard any number of (.+?) cards`).exec(s))) {
    const filter = discardFilterOf(m[1]);
    if (filter !== null) return { kind: "discard", target: "you", amount: 0, anyNumber: true, filter };
  }
  // "Target player reveals their hand and discards all nonland cards"
  // (Amnesia): every matching card, nothing chosen.
  if ((m = re(`(target player|target opponent) reveals their hand and discards all (.+?) cards`).exec(s))) {
    const filter = discardFilterOf(m[2]);
    if (filter !== null) return { kind: "discard-hand", who: slot(m[1]), filter, reveal: true };
  }
  if ((m = re(`(target player|target opponent) discards ${N} cards?`).exec(s))) {
    return { kind: "discard", target: slot(m[1]), amount: amount(m[2]) };
  }
  if ((m = re(`each opponent discards ${N} cards?`).exec(s))) {
    return { kind: "discard", target: "each-opponent", amount: amount(m[1]) };
  }
  if ((m = re(`mill ${N} cards?`).exec(s))) return { kind: "mill", target: "you", amount: amount(m[1]) };
  // "Exile the top eight cards of your library" (Herald of Amity): face up,
  // with no permission to play them — what a following sentence says of
  // them reads `thisWay: "exiled"`.
  // Face down and linked, with no permission (rules 406.3, 607.2a): "exile the
  // top card of your library face down" (Bomat Courier) and each player's
  // (Pyxis of Pandemonium), or "look at … then exile it face down" (Kayla's
  // Music Box, Lobelia).
  const faceDownExile = (faceDown, rest) => ({ kind: "exile-from-library", ...rest, faceDown, linked: true });
  if (re("exile the top card of your library face down").test(s)) return faceDownExile(true, { amount: 1 });
  if ((m = re(`exile the top ${N} cards of your library face down`).exec(s))) return faceDownExile(true, { amount: amount(m[1]) });
  if (re("each player exiles the top card of their library face down").test(s)) {
    return faceDownExile(true, { whose: "each-player", amount: 1 });
  }
  if (re("look at the top card of your library, then exile it face down").test(s)) return faceDownExile("looked", { amount: 1 });
  if (re("exile the top card of your library face down and look at it").test(s)) return faceDownExile("looked", { amount: 1 });
  if (re("look at the top card of each opponent's library and exile those cards face down").test(s)) {
    return faceDownExile("looked", { whose: "each-opponent", amount: 1 });
  }
  // What the source's other abilities do with them.
  if (re("put all cards exiled with (?:~|it) into (?:their owners?'s?|its owner's) hands?").test(s)) {
    return { kind: "return-exiled-by-source", linked: "hand" };
  }
  if (re("put all cards exiled with (?:~|it) into (?:their owners?'s?|its owner's) graveyards?").test(s)) {
    return { kind: "return-exiled-by-source", linked: "graveyard" };
  }
  if (re("turn (?:all cards exiled with ~|the exiled card) face up").test(s)) return { kind: "turn-exiled-face-up" };
  if (re("each player turns face up all cards they own exiled with ~, then puts all permanent cards among them onto the battlefield").test(s)) {
    return {
      kind: "sequence",
      effects: [
        { kind: "turn-exiled-face-up" },
        {
          kind: "return-exiled-by-source",
          linked: "battlefield",
          filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
        },
      ],
    };
  }
  if ((m = re(`exile the top ${N} cards of your library`).exec(s))) return { kind: "exile-from-library", amount: amount(m[1]) };
  // The top card of a player the effect names; `linkedExile` below links it if
  // the card says "exiled with" it (Nightveil Specter).
  if ((m = re("(that player|each opponent|each player) exiles the top card of their library").exec(s))) {
    const whose = { "that player": "trigger-player", "each opponent": "each-opponent", "each player": "each-player" }[m[1].toLowerCase()];
    return { kind: "exile-from-library", whose, amount: 1 };
  }
  // "Exile the top seven cards of that player's library, then put a creature
  // card from among them onto the battlefield under your control" (Lord of
  // the Void): the player a combat damage trigger names; the put isn't
  // optional (its ruling).
  if ((m = re(`exile the top ${N} cards of that player's library, then put an? (\\w+) card from among them onto the battlefield under your control`).exec(s))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return {
      kind: "sequence",
      effects: [
        { kind: "exile-from-library", whose: "trigger-player", amount: amount(m[1]) },
        {
          kind: "look-and-choose",
          zone: "exile",
          min: 1,
          max: 1,
          filter: { thisWay: "exiled", ...filter },
          destination: "battlefield",
          leftover: "stay",
        },
      ],
    };
  }
  if ((m = re(`(target player|target opponent) mills ${N} cards?`).exec(s))) {
    return { kind: "mill", target: slot(m[1]), amount: amount(m[2]) };
  }
  // "Look at the top three cards of target player's library, then put them
  // back in any order" (Architects of Will, Index): every card picked, the
  // picks their order on top. Another player's is `from` — you still look.
  if ((m = re(`look at the top ${N} cards of (your|target player's|target opponent's) library, then put them back in any order`).exec(s))) {
    const count = amount(m[1]);
    const from = m[2] === "your" ? undefined : slot(m[2].replace(/'s$/, ""));
    if (typeof count === "number" && (m[2] === "your" || from !== undefined)) {
      return {
        kind: "look-and-choose",
        ...(from !== undefined ? { from: { target: from } } : {}),
        zone: "library",
        count,
        min: count,
        max: count,
        destination: "library-top",
        leftover: "stay",
      };
    }
  }
  // "Look at target player's hand" (Glasses of Urza): a look alone.
  if ((m = re(`look at (target player|target opponent)'s hand`).exec(s))) {
    return { kind: "look-at-hand", target: slot(m[1]) };
  }
  // "Look at the top card of target player's library" (Mishra's Bauble), or
  // the top three (Orcish Spy): a look alone.
  if ((m = re(`look at the top card of (target player|target opponent)'s library`).exec(s))) {
    return { kind: "look-at-library-top", target: slot(m[1]) };
  }
  if ((m = re(`look at the top ${N} cards of (target player|target opponent)'s library`).exec(s))) {
    const count = amount(m[1]);
    if (typeof count === "number") return { kind: "look-at-library-top", target: slot(m[2]), count };
  }
  // "Look at a card at random in target player's hand" (Urza's Bauble): the
  // controller alone sees the one card picked.
  if ((m = re(`look at a card at random in (target player|target opponent)'s hand`).exec(s))) {
    return { kind: "choose-random-card", zone: "hand", whose: slot(m[1]), show: "look" };
  }
  // "Target opponent reveals a card at random from their hand" (Hired
  // Torturer's tail): shown to every player, and it stays there.
  if ((m = re(`(target player|target opponent) reveals a card at random from their hand`).exec(s))) {
    return { kind: "choose-random-card", zone: "hand", whose: slot(m[1]), show: "reveal" };
  }
  // "That player reveals a card at random from their hand" (Merfolk Spy): the
  // player the trigger is about.
  if (ctx?.thatPlayer !== undefined && re(`that player reveals a card at random from their hand`).test(s)) {
    return { kind: "choose-random-card", zone: "hand", whose: "that-player", show: "reveal" };
  }
  // "Target player reveals their hand" (Search Warrant's first sentence), and
  // "target player loses 1 life and reveals their hand" (Thoughtcutter
  // Agent): shown to every player, and it stays there (rule 701.20a).
  if ((m = re(`(target player|target opponent) reveals their hand`).exec(s))) {
    return { kind: "reveal-hand", who: slot(m[1]) };
  }
  if ((m = re(`(target player|target opponent) loses ${N} life and reveals their hand`).exec(s))) {
    const who = slot(m[1]);
    return {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: amount(m[2]), target: who },
        { kind: "reveal-hand", who },
      ],
    };
  }
  // "Exile target player's graveyard" (Bojuka Bog, Nautiloid Ship): every card
  // in it at once.
  if ((m = re(`exile (target player|target opponent)'s graveyard`).exec(s))) {
    return { kind: "exile-graveyard", target: slot(m[1]) };
  }
  // "[You may] put a creature card exiled with ~ onto the battlefield under
  // your control" (Nautiloid Ship, Sisters of Stone Death): one of the cards
  // linked to the source (rule 607.2a), chosen.
  if ((m = re(`(you may )?put an? (creature|artifact|land|permanent) card exiled with ~ onto the battlefield under your control`).exec(s))) {
    const kind = m[2].toLowerCase();
    const filter =
      kind === "permanent"
        ? { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] }
        : { type: kind };
    return {
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: m[1] === undefined ? 1 : 0,
      max: 1,
      filter,
      destination: "battlefield",
      leftover: "stay",
    };
  }
  // "Return a card exiled with ~ to its owner's hand" (Bane Alley Broker), "put
  // a card exiled with this Saga into its owner's hand" (Roads Go Ever, Ever
  // On): one of them, chosen as this resolves.
  if (re(`(?:return|put) a card exiled with ~ (?:to|into) its owner's hand`).test(s)) {
    return { kind: "look-and-choose", zone: "exiled-with-source", min: 1, max: 1, destination: "hand", leftover: "stay" };
  }
  // "Return a card exiled with ~ to the battlefield" (Purgatory): a return is
  // under its owner's control (rule 610.3c), not the chooser's.
  if (re(`return a card exiled with ~ to the battlefield`).test(s)) {
    return {
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 1,
      max: 1,
      destination: "battlefield",
      under: "owners",
      leftover: "stay",
    };
  }
  // "[You may] have ~ become a copy of a creature card exiled with it until end
  // of turn" (Lazav): the card only chosen, and copied as the card it is.
  if ((m = re(`have ~ become a copy of an? (creature|artifact) card exiled with (?:it|~) until end of turn`).exec(s))) {
    return {
      kind: "look-and-choose",
      zone: "exiled-with-source",
      min: 1,
      max: 1,
      filter: { type: m[1].toLowerCase() },
      destination: "stay",
      leftover: "stay",
      then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
    };
  }
  // "Then put all cards exiled this way into their owners' hands" (Worlds
  // Within Worlds): every card the resolution exiled, still there.
  if (re(`(?:then )?put all cards exiled this way into their owners' hands`).test(s)) {
    return { kind: "move-exiled-this-way", to: "hand" };
  }
  // "Put up to X land cards from your hand and/or graveyard onto the
  // battlefield tapped" (Worldsoul's Rage): one choice over both zones.
  if ((m = re(`put up to ${N} (.+?) cards from your hand and/or graveyard onto the battlefield( tapped)?`).exec(s))) {
    const count = amount(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (count !== undefined && count !== null && filter !== null && Object.keys(filter).length > 0) {
      return {
        kind: "return-from-graveyard",
        from: "hand-or-graveyard",
        filter,
        destination: "battlefield",
        count,
        upTo: true,
        ...(m[3] !== undefined ? { enterTapped: true } : {}),
      };
    }
  }
  // "Put all cards exiled with ~ onto the battlefield" (Underworld Sentinel):
  // under the putting player's control (rule 110.2a).
  if (re(`put all cards exiled with (?:~|it) onto the battlefield`).test(s)) {
    return { kind: "return-exiled-by-source", linked: "battlefield", under: "you" };
  }
  // "You lose half your life, rounded up" (rule 107.1a — Doomsday).
  if (/^you lose half your life, rounded up\.$/i.test(s)) {
    return { kind: "lose-life", amount: { half: { lifeTotal: "you" }, round: "up" } };
  }
  // Grievous Wound's "they": the player it enchants, the player the damage hit.
  if (/^they lose half their life, rounded up\.$/i.test(s)) {
    return { kind: "lose-life", who: "trigger-player", amount: { half: { lifeTotal: "each" }, round: "up" } };
  }
  // Graveyard order (rule 404.2): Soldevi Digger, Phyrexian Furnace, Guiding
  // Spirit; Fossil Find's "then reorder".
  if ((m = re(`put the top card of your graveyard on the bottom of your library`).exec(s))) {
    return { kind: "top-of-graveyard", then: { kind: "put-on-library", target: 0, position: "bottom" } };
  }
  if ((m = re(`exile the bottom card of target player's graveyard`).exec(s))) {
    return { kind: "top-of-graveyard", whose: ctx.target("player"), bottom: true, then: { kind: "exile", target: 0 } };
  }
  if ((m = re(`if the top card of target player's graveyard is an? (.+?) card, put that card on top of that player's library`).exec(s))) {
    const ifIt = parseTypePhrase(m[1]);
    if (ifIt !== null && Object.keys(ifIt).length > 0) {
      return {
        kind: "top-of-graveyard",
        whose: ctx.target("player"),
        ifIt,
        then: { kind: "put-on-library", target: 0, position: "top" },
      };
    }
  }
  if ((m = re(`return a card at random from your graveyard to your hand, then reorder your graveyard as you choose`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "choose-random-card", zone: "graveyard", then: { kind: "return-to-hand", target: 0, from: "graveyard" } },
        { kind: "reorder-graveyard" },
      ],
    };
  }
  // "Choose a card at random [that was] exiled with ~. Put that card into its
  // owner's hand" (Skyship Weatherlight, Gorex): rule 607.2a's linked cards.
  if ((m = re(`choose a card at random (?:that was )?exiled with ~(?:\\.|,)? (?:and )?put that card into its owner's hand`).exec(s))) {
    return {
      kind: "choose-random-card",
      zone: "exiled-with-source",
      then: { kind: "return-to-hand", target: 0, from: "exile" },
    };
  }
  if ((m = re(`each opponent mills ${N} cards?`).exec(s))) {
    return { kind: "mill", target: "each-opponent", amount: amount(m[1]) };
  }
  if ((m = re(`scry ${N}`).exec(s))) return { kind: "scry", amount: amount(m[1]) };
  // "Target player scries 2": `scry` has no `who`, so the player does it (`as-player`).
  if ((m = re(`target player scries ${N}`).exec(s))) {
    const target = slot("target player");
    return target === undefined
      ? null
      : { kind: "as-player", who: { target }, effect: { kind: "scry", amount: amount(m[1]) } };
  }
  if ((m = re(`surveil ${N}`).exec(s))) return { kind: "surveil", amount: amount(m[1]) };
  // "You may collect evidence N" (rule 701.59a): the decision can be declined.
  if ((m = re(`you may collect evidence (\\d+)`).exec(s))) return { kind: "collect-evidence", amount: Number(m[1]) };
  // Rad counters (rule 728): a player counter.
  if ((m = re(`(target player|target opponent) gets ${N} rad counters?`).exec(s))) {
    return { kind: "add-player-counters", counter: "rad", amount: amount(m[2]), target: slot(m[1]) };
  }
  if ((m = re(`(you get|each player gets|each opponent gets) ${N} rad counters?`).exec(s))) {
    const who = { "you get": undefined, "each player gets": "each-player", "each opponent gets": "each-opponent" }[m[1].toLowerCase()];
    return { kind: "add-player-counters", counter: "rad", amount: amount(m[2]), ...(who !== undefined ? { who } : {}) };
  }
  // A player losing every counter of a kind (rule 122.8): "target player
  // loses all poison counters" (Leeches), "… all rad counters" (Survivor's
  // Med Kit's RadAway).
  if ((m = re(`(target player|target opponent|you) loses? all (poison|rad|experience) counters`).exec(s))) {
    const who = m[1].toLowerCase() === "you" ? {} : { target: slot(m[1]) };
    return { kind: "remove-player-counters", counter: m[2].toLowerCase(), amount: "all", ...who };
  }

  // Life.
  // "Your life total becomes 4", "target player's life total becomes half
  // their starting life total, rounded down", "each player's life total
  // becomes the number of creatures they control" (rule 119.5).
  if ((m = re(`(your|target player's|target opponent's|up to one target player's|each player's) life total becomes (?:equal to )?(.+?)`).exec(s))) {
    const whose = m[1].toLowerCase();
    const each = whose === "each player's";
    const what = m[2];
    const half = /^half (?:your|their) starting life total, rounded (up|down)$/i.exec(what);
    const counted = each ? /^the number of (.+) they control$/i.exec(what) : null;
    const filter = counted === null ? null : parseTypePhrase(counted[1]);
    let total;
    if (new RegExp(`^${N}$`, "i").test(what) && !/^(?:a|an|x)$/i.test(what)) total = amount(what);
    else if (/^(?:your|their) starting life total$/i.test(what)) total = { startingLifeTotal: true };
    else if (half !== null) total = { half: { startingLifeTotal: true }, round: half[1].toLowerCase() };
    else if (each && /^the lowest life total among all players$/i.test(what)) total = { lowestLifeTotal: true };
    else if (filter !== null && Object.keys(filter).length > 0) total = { countOf: { ...filter, controlledBy: "you" }, forEachPlayer: true };
    if (total !== undefined) {
      if (whose === "your") return { kind: "set-life-total", who: "you", amount: total };
      if (each) return { kind: "set-life-total", who: "each-player", amount: total };
      // Torgaar's "up to one" is the target's own shape, so only the plain
      // targets are read here.
      if (whose !== "up to one target player's") {
        return { kind: "set-life-total", who: slot(whose.replace(/'s$/, "")), amount: total };
      }
    }
  }
  if ((m = re(`(?:you )?gain ${N} life`).exec(s))) return { kind: "gain-life", amount: amount(m[1]) };
  if ((m = re(`each opponent loses ${N} life`).exec(s))) {
    return { kind: "lose-life", amount: amount(m[1]), who: "each-opponent" };
  }
  if ((m = re(`(target player|target opponent) loses ${N} life`).exec(s))) {
    return { kind: "lose-life", amount: amount(m[2]), target: slot(m[1]) };
  }
  if ((m = re(`each opponent loses ${N} life and you gain ${N} life`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: amount(m[1]), who: "each-opponent" },
        { kind: "gain-life", amount: amount(m[2]) },
      ],
    };
  }
  if ((m = re(`each opponent loses ${N} life and you gain that much life`).exec(s))) {
    const n = amount(m[1]);
    return {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: n, who: "each-opponent" },
        { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
      ],
    };
  }

  // Damage.
  // Radiance (Ravnica: City of Guilds): "target X and each other X that
  // shares a color with it" — one `-all` effect over the target and the
  // others sharing a color with it (`sharesColorWithTarget`) — or a creature
  // or card type (`sharesCreatureTypeWith` / `sharesCardTypeWith` of the
  // slot: Killer's "target creature and each other creature that shares a
  // creature type with it").
  const KIN = `and each other (permanent|creature|artifact|enchantment|land) that shares a (color|creature type|card type) with it`;
  const SHARES_KEY = { color: "sharesColorWithTarget", "creature type": "sharesCreatureTypeWith", "card type": "sharesCardTypeWith" };
  const kin = (type, what, target) =>
    target === undefined
      ? undefined
      : { ...(type.toLowerCase() !== "permanent" ? { type: type.toLowerCase() } : {}), [SHARES_KEY[what.toLowerCase()]]: target };
  if ((m = re(`~ deals ${N} damage to (${TARGET}) ${KIN}`).exec(s))) {
    const filter = kin(m[3], m[4], slot(m[2]));
    return filter === undefined ? null : { kind: "damage-all", amount: amount(m[1]), filter };
  }
  if ((m = re(`~ deals ${N} damage to (${TARGET})`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), target: slot(m[2]) };
  }
  if ((m = re(`~ deals ${N} damage to each opponent`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), who: "each-opponent" };
  }
  if ((m = re(`~ deals ${N} damage to each player`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), who: "each-player" };
  }
  if ((m = re(`~ deals ${N} damage to each creature`).exec(s))) {
    return { kind: "damage-all", amount: amount(m[1]), filter: { type: "creature" } };
  }
  if ((m = re(`~ deals ${N} damage to each creature your opponents control`).exec(s))) {
    return { kind: "damage-all", amount: amount(m[1]), filter: { type: "creature", controlledBy: "opponent" } };
  }
  if ((m = re(`~ fights (${TARGET})`).exec(s))) return { kind: "fight", a: "source", b: slot(m[1]) };
  // "When this creature enters, it fights target creature…" (Scab-Clan Giant).
  if ((m = re(`it fights (${TARGET})`).exec(s)) && ctx.it === "source" && ctx.targets.length === 0) {
    return { kind: "fight", a: "source", b: slot(m[1]) };
  }
  // "Target opponent gains control of this artifact" (Jinxed Idol, Witch Hunt).
  if ((m = re(`(target opponent|target player) gains control of ~`).exec(s))) {
    return { kind: "gain-control", target: "source", who: { target: slot(m[1]) }, untilEndOfTurn: false };
  }
  // Every permanent of a kind its own source (`each-deals-damage`): "each
  // creature deals damage to itself equal to its power" (Solar Blaze), "each
  // other Bird you control deals damage equal to its power to target creature
  // an opponent controls" (Bartz and Boko), "each creature you control deals
  // damage equal to its power to each opponent" (Lukka), "each Dragon you
  // control deals 1 damage to …".
  if ((m = re(`each (.+?) deals damage to itself equal to its power`).exec(s))) {
    const dealers = dealersOf(m[1], true);
    if (dealers !== null) return { kind: "each-deals-damage", ...dealers, amount: "its-power", to: "itself" };
  }
  if ((m = re(`each (.+?) deals (?:damage equal to its power|${N} damage) to (each opponent|${TARGET})`).exec(s))) {
    const power = m[2] === undefined;
    const dealers = dealersOf(m[1], power);
    const to = dealers === null ? undefined : m[3].toLowerCase() === "each opponent" ? { who: "each-opponent" } : slot(m[3]);
    if (dealers !== null && to !== undefined) {
      return { kind: "each-deals-damage", ...dealers, amount: power ? "its-power" : amount(m[2]), to };
    }
  }

  // Tokens.
  // One kind of token, its "with" a list of keywords only: "create a Food
  // token or a Treasure token", "…with deathtouch and a 3/3 … with lifelink",
  // two kinds in one sentence ("X Halflings and X Food tokens") and a token
  // with a quoted ability are left to a person.
  // A Role token created attached (rule 303.7 — Wilds of Eldraine): "create a
  // Monster Role token attached to target creature you control", "… to up to
  // one other target creature you control", "… to it" (the source, or the
  // object the trigger names).
  if ((m = /^create an? (Cursed|Monster|Royal|Sorcerer|Virtuous|Wicked|Young Hero) Role token attached to (.+)\.$/i.exec(s))) {
    const token = `${m[1].replace(/\b\w/g, (c) => c.toUpperCase())} Role Token`;
    if (/^it$/i.test(m[2])) {
      const it = ctx.targets.length === 0 ? ctx.it : undefined;
      return it === undefined ? null : { kind: "create-token", token, count: 1, attachedTo: it };
    }
    const q = quantifiedSlots(m[2], ctx);
    const host = q !== undefined ? (q.group || q.slots.length !== 1 ? undefined : q.slots[0]) : slot(m[2]);
    return host === undefined ? null : { kind: "create-token", token, count: 1, attachedTo: host };
  }
  const KWS = `${KW}(?:(?:, | and |, and )${KW})*`;
  if ((m = re(`create ${N} (tapped )?([^"“]+?) tokens?(?: with (${KWS}))?`).exec(s)) && !/ or | and an? |\btokens? and /.test(m[3])) {
    // "An X/X green Treefolk": the X the spell was cast with, as its base
    // P/T. An X defined some other way ("where X is …") isn't read.
    const xx = /^X\/X /.test(m[3]);
    if (xx && /where X is/i.test(s)) return null;
    const name = ctx.tokenFor?.(`${m[3]}${m[4] ? ` with ${m[4]}` : ""}`) ?? null;
    if (name === null) return null;
    return {
      kind: "create-token",
      token: name,
      count: amount(m[1]),
      ...(m[2] ? { tapped: true } : {}),
      ...(xx ? { basePt: { power: "x", toughness: "x" } } : {}),
    };
  }
  // "Target opponent creates a 1/1 colorless Spirit creature token" (Forbidden
  // Orchard, Hunted Lammasu): under that player's control.
  if ((m = re(`(target player|target opponent) creates ${N} ([^"“]+?) tokens?`).exec(s)) && !/ or | and an? |\btokens? and /.test(m[3])) {
    const name = ctx.tokenFor?.(m[3]) ?? null;
    if (name === null) return null;
    slot(m[1]);
    return { kind: "create-token", token: name, count: amount(m[2]), who: "target-controller" };
  }
  // A token copy of a linked source: the creature enchanted, a card exiled
  // with this (rule 607.2a), or "the exiled card" — of the cost when the cost
  // exiled one, otherwise of the linked ability. Exceptions only as far as
  // they're read here.
  if ((m = re("create a token that's a copy of (enchanted creature|a card exiled with ~|the exiled card)(?:, except (.+))?").exec(s))) {
    const except = m[2] === undefined ? {} : tokenCopyExceptOf(m[2]);
    if (except === null) return null;
    return {
      kind: "create-token-copy",
      of: /enchanted/i.test(m[1]) ? "enchanted" : ctx.costExiled === true ? "exiled-as-cost" : "exiled-with-source",
      ...(/^a card/i.test(m[1]) ? { chooseOne: true } : {}),
      count: 1,
      ...(/enchanted/i.test(m[1]) ? { who: "you" } : {}),
      ...except,
    };
  }
  if (re("investigate").test(s)) return { kind: "create-token", token: "Clue Token", count: 1 };
  // Learn (rule 701.48a): the rummage, or else a Lesson from the sideboard
  // (`learn()` in helpers.ts).
  if (re("learn").test(s)) {
    return {
      kind: "sequence",
      effects: [
        {
          kind: "may",
          prompt: "Learn: discard a card to draw a card?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "discard", target: "you", amount: 1 },
              { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
            ],
          },
        },
        {
          kind: "conditional",
          condition: { kind: "not", of: { kind: "this-way", what: "discarded" } },
          then: {
            kind: "search-library",
            filter: { subtype: "Lesson" },
            destination: "hand",
            min: 0,
            max: 1,
            reveal: true,
            outside: "only",
          },
        },
      ],
    };
  }
  // Amass [type] N (rule 701.47): "Amass Orcs 2." — the type singular.
  if ((m = re(`amass ([A-Z][a-z]+) (\\d+)`).exec(s))) {
    const plural = m[1];
    const creatureType = /ves$/.test(plural) ? plural.replace(/ves$/, "f") : plural.replace(/s$/, "");
    return { kind: "amass", amount: Number(m[2]), creatureType };
  }

  // A counter put on a target, then something done to "each creature that
  // had a [kind] counter put on it this way" (`thisWay: "counters-put"` — only
  // that kind was put): Fangs of Kalonia's "then double the number of +1/+1
  // counters on each …", Spectacular Showdown's "then goad each …".
  if (
    (m = /^put (a|an|one|two|three) ([+-]\d+\/[+-]\d+|[a-z]+(?: strike)?) counters? on (target [^,]+), then (double the number of ([+-]\d+\/[+-]\d+|[a-z]+) counters on|goad) each creature that had an? ([+-]\d+\/[+-]\d+|[a-z]+(?: strike)?) counter put on it this way\.$/i.exec(s)) &&
    m[2].toLowerCase() === m[6].toLowerCase() &&
    (m[5] === undefined || m[5].toLowerCase() === m[2].toLowerCase())
  ) {
    const counter = m[2].toLowerCase().replace(" ", "-");
    // Read with a one-word stand-in for the kind ("double strike" is two).
    const one = m[1] === "a" || m[1] === "an" || m[1] === "one";
    const placed = parseSentence(`Put ${m[1]} plain counter${one ? "" : "s"} on ${m[3]}.`, ctx);
    if (placed === null || placed.kind !== "add-counter") return null;
    const put = { ...placed, counter };
    const those = { type: "creature", thisWay: "counters-put" };
    const then = m[5] !== undefined ? { kind: "double-counters-all", filter: those, counterKind: counter } : { kind: "goad", filter: those };
    return { kind: "sequence", effects: [put, then] };
  }
  // Counters.
  // "On the creature tapped to pay this spell's additional cost" (Swallow Whole).
  if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on the creature tapped to pay ~'s additional cost`).exec(s))) {
    return { kind: "add-counter", target: "tapped", counter: m[2].toLowerCase(), amount: amount(m[1]) };
  }
  // Any named kind: +1/+1, oil (Phyrexia: All Will Be One), stun, shield.
  if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on (~|${TARGET}|each creature you control|each other creature you control)`).exec(s))) {
    const n = amount(m[1]);
    const counter = m[2].toLowerCase();
    if (m[3] === "~") return { kind: "add-counter", target: "source", counter, amount: n };
    if (/^each/.test(m[3])) {
      if (/other/.test(m[3]) && !otherMeansSource(ctx)) return null;
      return {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter,
        amount: n,
        ...(/other/.test(m[3]) ? { exceptSource: true } : {}),
      };
    }
    return { kind: "add-counter", target: slot(m[3]), counter, amount: n };
  }
  if (re("proliferate").test(s)) return { kind: "proliferate" };
  // "Double the number of each kind of counter on target creature" (Vorel of
  // the Hull Clade).
  if ((m = re(`double the number of each kind of counter on (${TARGET})`).exec(s))) {
    const target = slot(m[1]);
    return target === undefined ? null : { kind: "double-counters", target };
  }
  // "You may cast up to three spells from among face-up cards your opponents
  // own from exile without paying their mana costs" (Ashiok, Nightmare Muse).
  if ((m = re(`you may cast up to ${N} spells from among face-up cards your opponents own from exile without paying their mana costs`).exec(s))) {
    return { kind: "cast-now", from: "face-up-exile-opponents-own", repeat: true, upTo: amount(m[1]), free: true };
  }
  // Time travel (rule 701.56a).
  if (re("time travel").test(s)) return { kind: "time-travel" };
  // Moving counters (rule 122.5): "a [kind] counter from ~ onto …", "all
  // counters from ~ onto …", "a counter" (a kind chosen as it resolves) or
  // "any number of counters" from one target onto a second.
  if ((m = re(`move an? ([+-]\\d+/[+-]\\d+|[a-z]+) counter from ~ onto (${TARGET})`).exec(s)) && m[1].toLowerCase() !== "counter") {
    return { kind: "move-counters", from: "source", to: slot(m[2]), counter: m[1].toLowerCase() };
  }
  if ((m = re(`move all counters from ~ onto (${TARGET})`).exec(s))) {
    return { kind: "move-counters", from: "source", to: slot(m[1]), amount: "all" };
  }
  if ((m = re(`move (a counter|any number of counters) from (${TARGET}) onto (?:a second )?(${TARGET})`).exec(s))) {
    const from = slot(m[2]);
    return {
      kind: "move-counters",
      from,
      to: slot(m[3]),
      ...(/^any/i.test(m[1]) ? { amount: "any" } : {}),
    };
  }
  // Removing counters in bulk: "remove all counters from target permanent"
  // (every kind — Vampire Hexmage), "remove all charge counters from ~" (one
  // kind), and off every permanent matching: "remove all fate counters from
  // all permanents" (Oblivion Stone), "remove two loyalty counters from each
  // planeswalker" (Pestilent Haze), "remove a -1/-1 counter from each
  // creature you control" (Heartmender).
  if ((m = re(`remove all (?:([+-]\\d+/[+-]\\d+|[a-z]+) )?counters from (~|${TARGET})`).exec(s)) && !/^all /i.test(m[2])) {
    const target = m[2] === "~" ? "source" : slot(m[2]);
    return target === undefined ? null : { kind: "remove-counter", target, counter: m[1]?.toLowerCase() ?? "any", amount: "all" };
  }
  {
    const massFilter = (phrase) => {
      const own = / (you control|an opponent controls|your opponents control)$/i.exec(phrase);
      const filter = parseTypePhrase(own === null ? phrase : phrase.slice(0, own.index));
      if (filter === null) return null;
      return own === null ? filter : { ...filter, controlledBy: /^you /i.test(own[1]) ? "you" : "opponent" };
    };
    const all = re(`remove all (?:([+-]\\d+/[+-]\\d+|[a-z]+) )?counters from all ([a-z ]+)`).exec(s);
    const each = all === null ? re(`remove ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? from each ([a-z ]+)`).exec(s) : null;
    const filter = all !== null ? massFilter(all[2]) : each !== null ? massFilter(each[3]) : undefined;
    if (filter === null) return null;
    if (all !== null) return { kind: "remove-counter-all", filter, counter: all[1]?.toLowerCase() ?? "any", amount: "all" };
    if (each !== null && each[2].toLowerCase() !== "counter") {
      return { kind: "remove-counter-all", filter, counter: each[2].toLowerCase(), amount: amount(each[1]) };
    }
  }
  // Counters the controller chooses as it resolves (the `remove-counters`
  // decision, rule 608.2c): of any kinds — "remove up to five counters from
  // target permanent" (Render Inert), "remove a counter from target nonland
  // permanent" (Thrull Parasite), "remove any number of counters from target
  // creature you control" (Rhys, the Evermore) — or "up to N" of one kind
  // ("remove up to four charge counters from target noncreature artifact" —
  // Gremlin Mine). "You may remove a counter" is up to one; a "may" over more
  // is all or none, which this isn't. A player target gives up their own
  // (Price of Betrayal's "…, or opponent").
  if (
    (m = re(
      `(you may )?remove (up to )?(${N.slice(1, -1)}|any number of) (?:([+-]\\d+/[+-]\\d+|[a-z]+) )?counters? from (~|${TARGET})`,
    ).exec(s)) &&
    !/^all /i.test(m[5])
  ) {
    const may = m[1] !== undefined;
    const upTo = m[2] !== undefined;
    const any = /^any number/i.test(m[3]);
    const count = any ? "any" : amount(m[3]);
    const kind = m[4]?.toLowerCase();
    const target = m[5] === "~" ? "source" : slot(m[5]);
    const fits =
      count !== undefined &&
      target !== undefined &&
      !(may && (upTo || any || count !== 1)) &&
      // One named kind, a fixed number: `remove-counter`, nothing to choose.
      (kind === undefined || upTo || any);
    if (fits) {
      return {
        kind: "remove-counters",
        target,
        counter: kind ?? "any",
        count,
        ...(upTo || may ? { upTo: true } : {}),
      };
    }
  }
  // "Remove any number of counters from among permanents on the battlefield"
  // (Eventide's Shadow): anyone's.
  if (re(`remove any number of counters from among permanents on the battlefield`).test(s)) {
    return { kind: "remove-counters", from: {}, anyController: true, counter: "any", count: "any", among: true };
  }
  // "Put its counters on …" / "put those counters on …" of a permanent that
  // left (rule 122.8): each kind it had, put on — the ability's own object
  // (a self dies or leaves trigger) or the one its trigger names.
  if (ctx.departed !== undefined && (m = re(`put (?:its|those) counters on (~|up to one ${TARGET}|${TARGET})`).exec(s))) {
    const target =
      m[1] === "~" ? "source" : /^up to one /i.test(m[1]) ? quantifiedSlots(m[1], ctx)?.slots[0] : slot(m[1]);
    return { kind: "put-counters-of", of: ctx.departed, target };
  }

  // Removal and movement.
  // "Target X and all other Xs with the same name as that X" (rule 201.2a):
  // one `-all` effect over the target and its namesakes (`sameNameAsTarget`).
  const NAMESAKES = `and all other (permanents|creatures|artifacts|enchantments|lands) with the same name as that (?:permanent|creature|artifact|enchantment|land)`;
  const namesakes = (plural, target) => {
    const type = { permanents: undefined, creatures: "creature", artifacts: "artifact", enchantments: "enchantment", lands: "land" }[plural.toLowerCase()];
    return target === undefined ? undefined : { ...(type !== undefined ? { type } : {}), sameNameAsTarget: target };
  };
  // The same names off the battlefield. "Return target creature card and all
  // other cards with the same name as that card from your graveyard to your
  // hand" (Echoing Return) / "to the battlefield tapped" (Rat King).
  if ((m = /^return target creature card and all other cards with the same name as that card from your graveyard to (your hand|the battlefield tapped)\.$/i.exec(s))) {
    const target = ctx.target({ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } });
    const hand = m[1].toLowerCase() === "your hand";
    return {
      kind: "return-from-graveyard",
      filter: { sameNameAsTarget: target },
      destination: hand ? "hand" : "battlefield",
      count: "all",
      ...(hand ? {} : { enterTapped: true }),
    };
  }
  // "Search your library for any number of cards with the same name as that
  // card, reveal them, put them into your hand, then shuffle" (Secret Salvage),
  // "for a card with the same name as target nontoken creature, put that card
  // onto the battlefield, then shuffle" (Mask of the Mimic).
  if (ctx.targets.length === 1 && /^search your library for any number of cards with the same name as that card, reveal them, put them into your hand, then shuffle\.$/i.test(s)) {
    return { kind: "search-library", filter: { sameNameAsTarget: 0 }, destination: "hand", reveal: true, min: 0, max: 99 };
  }
  if (/^search your library for a card with the same name as target nontoken creature, put that card onto the battlefield, then shuffle\.$/i.test(s)) {
    const target = ctx.target({ kind: "permanent", filter: { type: "creature", token: false } });
    return { kind: "search-library", filter: { sameNameAsTarget: target }, destination: "battlefield", min: 0, max: 1 };
  }
  // "Exile target nonland permanent an opponent controls and all tokens that
  // player controls with the same name as that permanent" (Legions to Ashes).
  if (/^exile target nonland permanent an opponent controls and all tokens that player controls with the same name as that permanent\.$/i.test(s)) {
    const target = ctx.target({ kind: "permanent", filter: { notTypes: ["land"], controlledBy: "opponent" } });
    return {
      kind: "exile-all",
      filter: { controlledBy: "you", sameNameAsTarget: target, sameNameTokensOnly: true },
      controlledByTarget: target,
    };
  }
  // "Exile target creature an opponent controls with mana value 2 or less and
  // all other creatures that player controls with the same name as that
  // creature." (Legion's End's first sentence; its second is `revealAndExileAt`.)
  if ((m = /^exile target creature an opponent controls with mana value (\d+) or less and all other creatures that player controls with the same name as that creature\.$/i.exec(s))) {
    const target = ctx.target({
      kind: "permanent",
      filter: { type: "creature", controlledBy: "opponent", manaValue: { op: "lte", n: Number(m[1]) } },
    });
    return {
      kind: "exile-all",
      filter: { type: "creature", controlledBy: "you", sameNameAsTarget: target },
      controlledByTarget: target,
    };
  }
  // "If that creature was a God, its controller reveals their hand and exiles
  // all cards from it with the same name as that creature" (Hour of Glory).
  if (ctx.targets.length === 1 && (m = /^if that creature was an? ([A-Z][a-z]+), its controller reveals their hand and exiles all cards from it with the same name as that creature\.$/.exec(s[0].toLowerCase() + s.slice(1)))) {
    return {
      kind: "conditional",
      condition: { kind: "target", index: 0, filter: { subtype: m[1] } },
      then: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: { controllerOfTarget: 0 } },
          { kind: "exile-graveyard", target: { controllerOfTarget: 0 }, filter: { sameNameAsTarget: 0 }, fromHand: "only" },
        ],
      },
    };
  }
  // "Exile all noncreature, nonland cards from that player's hand and
  // graveyard" (Thought Distortion), after a player target: every match.
  if (
    ctx.targets.length === 1 &&
    (ctx.targets[0] === "player" || ctx.targets[0] === "opponent") &&
    (m = /^exile all (.+?) cards from that player's hand and graveyard\.$/i.exec(s))
  ) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter !== null) return { kind: "exile-graveyard", target: 0, filter, fromHand: "also" };
  }
  // "Exile target nonland card from a graveyard, all other cards from graveyards
  // with the same name as that card, and all permanents with that name"
  // (Moratorium Stone): the graveyards' in one move, then the battlefield's.
  if (/^exile target nonland card from a graveyard, all other cards from graveyards with the same name as that card, and all permanents with that name\.$/i.test(s)) {
    const target = ctx.target({ kind: "card-in-graveyard", whose: "any", filter: { notTypes: ["land"] } });
    return {
      kind: "sequence",
      effects: [
        { kind: "exile-graveyard", target: "each-player", filter: { sameNameAsTarget: target } },
        { kind: "exile-all", filter: { sameNameAsTarget: target } },
      ],
    };
  }
  // "Destroy target creature that blocked or was blocked by a legendary
  // creature this turn" (You Cannot Pass!), "exile … a Zombie …" (Time to
  // Reflect): the turn's blocks (`blockedThisTurn`).
  if ((m = /^(destroy|exile) target creature that blocked or was blocked by (.+?) this turn\.$/i.exec(s))) {
    const partner = blockPartnerPhrase(m[2]);
    if (partner !== null) {
      const target = ctx.target({
        kind: "permanent",
        filter: { type: "creature", blockedThisTurn: { relation: "either", partner } },
      });
      return { kind: m[1].toLowerCase(), target };
    }
  }
  // "Creatures that were blocked by that creature this combat gain trample
  // until end of turn" (Ride Down), after a target has been named.
  if (ctx.targets.length === 1 && (m = re(`creatures that were blocked by that creature this combat gain ${KW} until end of turn`).exec(s))) {
    return {
      kind: "grant-keyword-all",
      filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: 0, thisCombat: true } },
      keyword: KEYWORDS[m[1].toLowerCase()],
      duration: "end-of-turn",
    };
  }
  // "Destroy all creatures blocking or blocked by this creature" (Kjeldoran
  // Frostbeast), "… all non-Wall creatures blocking enchanted creature"
  // (Coils of the Medusa) — `blockingRelation`. Not exile: what the exile is
  // linked to is the card's other abilities' business.
  if ((m = re(`destroy all (${BLOCK_RELATION})`).exec(s))) {
    const filter = blockRelationFilterOf(m[1]);
    return filter === undefined ? null : { kind: "destroy-all", filter };
  }
  // "Destroy all creatures that dealt damage to you this turn" (Retaliate),
  // "Return each creature that dealt damage this turn to its owner's hand"
  // (Restore the Peace).
  if (/^destroy all creatures that dealt damage to you this turn\.$/i.test(s)) {
    return { kind: "destroy-all", filter: { type: "creature", dealtDamageThisTurn: { to: "you" } } };
  }
  if (/^return each creature that dealt damage this turn to its owner's hand\.$/i.test(s)) {
    return { kind: "return-to-hand-all", filter: { type: "creature", dealtDamageThisTurn: true } };
  }
  // "Destroy all other creatures" (Novablast Wurm), "destroy all other
  // enchantments" (Tranquil Grove), "destroy all creatures except for ~"
  // (Mageta the Lion), "destroy all permanents other than ~" (Worldslayer),
  // "destroy all other permanents except for lands and tokens" (Elspeth Tirel).
  if (/^destroy all other permanents except for lands and tokens\.$/i.test(s)) {
    return { kind: "destroy-all", filter: { notTypes: ["land"], token: false }, exceptSource: true };
  }
  // "Exile all tokens created with it", "destroy all tokens created with this
  // enchantment", "exile all other tokens created with this creature" (Faerie
  // Artisans). `parseFace` links what the card creates (`linkedToSource`).
  if ((m = re(`(destroy|exile) all (other )?tokens created with (?:~|it)`).exec(s))) {
    return {
      kind: m[1].toLowerCase() === "destroy" ? "destroy-all" : "exile-all",
      filter: { token: true, createdWithSource: true, ...(m[2] !== undefined ? { notThisWay: "created" } : {}) },
    };
  }
  // "… at the beginning of the next end step" (Arcane Artisan): the stint meant
  // is the one that made them, bound as this delayed trigger is created.
  if ((m = re(`exile all tokens created with (?:~|it) at the beginning of the next end step`).exec(s))) {
    return {
      kind: "delayed-trigger",
      at: "next-end-step",
      effect: { kind: "exile-all", filter: { token: true, createdWithSource: true } },
      text: "Exile all tokens created with it.",
    };
  }
  if ((m = re(`destroy all (?:other (.+)|(.+) (?:other than|except for) ~)`).exec(s))) {
    const yours = /^(.+) you control$/i.exec(m[1] ?? m[2]);
    const phrase = yours?.[1] ?? m[1] ?? m[2];
    const every = /^permanents$/i.test(phrase);
    const filter = every ? {} : parseTypePhrase(phrase);
    if (filter !== null && (every || Object.keys(filter).length > 0)) {
      return { kind: "destroy-all", filter: { ...filter, ...(yours !== null ? { controlledBy: "you" } : {}) }, exceptSource: true };
    }
  }
  if ((m = re(`(destroy|exile) (${TARGET}) ${NAMESAKES}`).exec(s))) {
    const filter = namesakes(m[3], slot(m[2]));
    return filter === undefined ? null : { kind: m[1].toLowerCase() === "destroy" ? "destroy-all" : "exile-all", filter };
  }
  // What's attached to a target (`attachedToTarget`): "return target
  // creature and all Auras attached to it to their owners' hands" (Hubris)
  // and "destroy target creature with flying and all Equipment attached to
  // that creature" (Eaten by Spiders) — one instruction, the attachments
  // read first; "destroy all Auras attached to target land" (Street
  // Sweeper), "destroy all Equipment attached to that creature" after a
  // sentence about the one target (Blastfire Bolt); "destroy all Curses
  // attached to you" (Witchbane Orb, `attachedToPlayer`).
  const ATTACHMENTS = "(Auras|Equipment|Auras and Equipment|Curses)";
  const attachmentsOf = (what) =>
    ({
      auras: { subtype: "Aura" },
      equipment: { subtype: "Equipment" },
      "auras and equipment": { subtypes: ["Aura", "Equipment"] },
      curses: { subtype: "Curse" },
    })[what.toLowerCase()];
  {
    const both = re(`(destroy|exile|return) (${TARGET}) and all ${ATTACHMENTS} attached to (?:it|that creature)( to their owners' hands)?`).exec(s);
    if (both !== null && (both[1].toLowerCase() === "return") === (both[4] !== undefined)) {
      const target = slot(both[2]);
      if (target === undefined) return null;
      const act = both[1].toLowerCase();
      const all = { destroy: "destroy-all", exile: "exile-all", return: "return-to-hand-all" }[act];
      const one = { destroy: "destroy", exile: "exile", return: "return-to-hand" }[act];
      return {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: all, filter: { ...attachmentsOf(both[3]), attachedToTarget: target } },
          { kind: one, target },
        ],
      };
    }
    const all = re(`(destroy|exile) all ${ATTACHMENTS} attached to (you|that creature|${TARGET})`).exec(s);
    if (all !== null) {
      const kind = all[1].toLowerCase() === "destroy" ? "destroy-all" : "exile-all";
      if (/^you$/i.test(all[3])) return { kind, filter: { ...attachmentsOf(all[2]), attachedToPlayer: "you" } };
      const target = /^that creature$/i.test(all[3]) ? (ctx.targets.length === 1 ? 0 : undefined) : slot(all[3]);
      return target === undefined ? null : { kind, filter: { ...attachmentsOf(all[2]), attachedToTarget: target } };
    }
    // "Exile up to one target Equipment attached to that creature" (Fiery
    // Annihilation): a slot attached to the one before it (`attachedToThan`).
    const one = re(`(destroy|exile) up to one target (Aura|Equipment) attached to that creature`).exec(s);
    if (one !== null) {
      if (ctx.targets.length !== 1) return null;
      const of = { kind: "permanent", filter: { subtype: one[2] } };
      const target = ctx.target({ kind: "optional", of: { kind: "other", of, than: { slot: 0 }, attachedToThan: true } });
      return { kind: one[1].toLowerCase(), target };
    }
  }
  // "Tap all other creatures" (Thundermare), "return all other creatures to their
  // owners' hands" (Aethersquall Ancient), "all other creatures lose flying until
  // end of turn" (Thundercloud Elemental): one instruction, each but the source.
  {
    const eachOther = (phrase, effect) => {
      const filter = parseTypePhrase(phrase);
      return filter === null || Object.keys(filter).length === 0
        ? null
        : { kind: "for-each-permanent", filter, exceptSource: true, simultaneous: true, effect };
    };
    if ((m = re(`tap all other ([a-z]+s)`).exec(s))) return eachOther(m[1], { kind: "tap", target: 0 });
    if ((m = re(`return all other ([a-z]+s) to their owners' hands`).exec(s))) {
      return eachOther(m[1], { kind: "return-to-hand", target: 0 });
    }
    if ((m = re(`all other ([a-z]+s) lose (flying) until end of turn`).exec(s))) {
      return eachOther(m[1], { kind: "lose-keywords", target: 0, keywords: [m[2].toLowerCase()], duration: "end-of-turn" });
    }
  }
  if ((m = re(`return (${TARGET}) ${NAMESAKES} to their owners' hands`).exec(s))) {
    const filter = namesakes(m[2], slot(m[1]));
    return filter === undefined ? null : { kind: "return-to-hand-all", filter };
  }
  if ((m = re(`(${TARGET}) ${NAMESAKES} gets? ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    const filter = namesakes(m[2], slot(m[1]));
    return filter === undefined
      ? null
      : { kind: "modify-pt-all", filter, power: Number(m[3]), toughness: Number(m[4]), duration: "end-of-turn" };
  }
  if ((m = re(`(destroy|untap|tap) (${TARGET}) ${KIN}`).exec(s))) {
    const filter = kin(m[3], m[4], slot(m[2]));
    return filter === undefined ? null : { kind: `${m[1].toLowerCase()}-all`, filter };
  }
  if ((m = re(`(${TARGET}) ${KIN} gets? ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    const filter = kin(m[2], m[3], slot(m[1]));
    return filter === undefined
      ? null
      : { kind: "modify-pt-all", filter, power: Number(m[4]), toughness: Number(m[5]), duration: "end-of-turn" };
  }
  // The Crowns: "enchanted creature and other creatures that share a
  // creature type with it get +1/+1 / gain flying until end of turn" — one
  // `-all` effect over the host and its kin (`sharesCreatureTypeWith:
  // "attached"`, the host in whatever its types).
  const CROWN = `enchanted creature and other creatures that share a creature type with it`;
  const crowned = { type: "creature", sharesCreatureTypeWith: "attached" };
  if ((m = re(`${CROWN} get ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    return { kind: "modify-pt-all", filter: crowned, power: Number(m[1]), toughness: Number(m[2]), duration: "end-of-turn" };
  }
  if ((m = re(`${CROWN} gain ${KW} until end of turn`).exec(s))) {
    return { kind: "grant-keyword-all", filter: crowned, keyword: KEYWORDS[m[1].toLowerCase()], duration: "end-of-turn" };
  }
  // "This creature and each other creature with the same name as it get
  // +3/+3" (Cylian Sunsinger): the source and its namesakes
  // (`sameNameWith: "source"`, rule 201.2a).
  if ((m = re(`(?:~|this creature) and each other creature with the same name as it gets? ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    return {
      kind: "modify-pt-all",
      filter: { type: "creature", sameNameWith: "source" },
      power: Number(m[1]),
      toughness: Number(m[2]),
      duration: "end-of-turn",
    };
  }
  // "Destroy all creatures that share a creature type with the sacrificed
  // creature" (Endemic Plague).
  if ((m = re(`destroy all creatures that share a creature type with the sacrificed creature`).exec(s))) {
    return { kind: "destroy-all", filter: { type: "creature", sharesCreatureTypeWith: "sacrificed" } };
  }
  // "Destroy up to X target artifacts", "tap X target creatures" (rule
  // 601.2c): a group as big as X, each member acted on — destroyed or exiled
  // together (Word of Binding's, By Force's shapes).
  if ((m = /^(destroy|exile|tap|untap) ((?:up to )?X target .+|(?:up to )?(?:two|three|four|five) target .*cards from (?:a single|an opponent's) graveyard)\.$/i.exec(s))) {
    const got = quantifiedSlots(m[2], ctx);
    if (got === undefined || !got.group) return null;
    const kind = m[1].toLowerCase();
    return {
      kind: "for-each-target",
      from: got.slots[0],
      ...(kind === "destroy" || kind === "exile" ? { simultaneous: true } : {}),
      effect: { kind, target: got.slots[0] },
    };
  }
  // "Return up to three target creature cards with total mana value 3 or
  // less from your graveyard to the battlefield" (Patch Up), "… with
  // different names …" (Behold the Sinister Six!): together.
  if ((m = /^return ((?:any number of|up to \w+) target .+ with (?:total mana value \d+ or less|different names) from your graveyard) to the battlefield\.$/i.exec(s))) {
    const got = quantifiedSlots(m[1], ctx);
    if (got === undefined || !got.group) return null;
    return {
      kind: "for-each-target",
      from: got.slots[0],
      simultaneous: true,
      effect: { kind: "put-onto-battlefield", target: got.slots[0] },
    };
  }
  if ((m = re(`destroy (${TARGET})`).exec(s))) return { kind: "destroy", target: slot(m[1]) };
  // "Gain control of target creature [until end of turn]" — for as long as
  // the effect lasts, which without a duration is the rest of the game.
  if ((m = re(`gain control of (${TARGET})( until end of turn)?`).exec(s))) {
    return { kind: "gain-control", target: slot(m[1]), untilEndOfTurn: m[2] !== undefined };
  }
  // "Gain control of all artifacts your opponents control until end of turn"
  // (Broadcast Takeover), "… all creatures with power 4 or greater …" (Mob Rule).
  if ((m = re(`gain control of all (.+) until end of turn`).exec(s))) {
    const theirs = /^(.+) your opponents control$/i.exec(m[1]);
    const strong = /^(.+) with power (\d+) or (greater|less)$/i.exec(theirs?.[1] ?? m[1]);
    const filter = parseTypePhrase(strong?.[1] ?? theirs?.[1] ?? m[1]);
    if (filter !== null && Object.keys(filter).length > 0) {
      return {
        kind: "gain-control-all",
        filter: {
          ...filter,
          ...(strong !== null ? { power: { op: strong[3].toLowerCase() === "greater" ? "gte" : "lte", n: Number(strong[2]) } } : {}),
          ...(theirs !== null ? { controlledBy: "opponent" } : {}),
        },
        untilEndOfTurn: true,
      };
    }
  }
  // "Exile target creature an opponent controls until an opponent becomes the
  // monarch" (Palace Jailer), "… until target enchantment you control leaves the
  // battlefield" (Calix, Destiny's Hand): rule 610.3, the end a parameter.
  if ((m = re(`exile (target [a-z' ]+?) until an opponent becomes the monarch`).exec(s))) {
    return { kind: "exile", target: slot(m[1]), until: "opponent-becomes-monarch" };
  }
  if ((m = re(`exile (target [a-z' ]+?) until (target [a-z' ]+?) leaves the battlefield`).exec(s))) {
    const exiled = slot(m[1]);
    const leaves = slot(m[2]);
    if (exiled === undefined || leaves === undefined) return null;
    return { kind: "exile", target: exiled, until: { targetLeaves: leaves } };
  }
  if ((m = re(`exile (${TARGET})`).exec(s))) return { kind: "exile", target: slot(m[1]) };
  // Airbend (rule 701.65a): exiled, its owner may cast it for {2}. Several
  // targets are one instruction, exiled together (603.10a).
  if ((m = /^airbend (.+)\.$/i.exec(s)) && !/^(it|that \w+|all )/i.test(m[1])) {
    const got = quantifiedSlots(m[1], ctx);
    if (got === undefined) return null;
    const one = (target) => ({ kind: "exile", target, airbend: true });
    if (got.group) return { kind: "for-each-target", from: got.slots[0], simultaneous: true, effect: one(got.slots[0]) };
    return got.slots.length === 1 ? one(got.slots[0]) : { kind: "sequence", simultaneous: true, effects: got.slots.map(one) };
  }
  // Phasing out (rule 702.26b): the source, the creature the source equips,
  // every permanent you control (Teferi's Protection), or one target, "up to
  // one", or "any number of" them, which phase out together. "…until ~
  // leaves the battlefield" (rule 610.4 — Oubliette's "tap that creature as
  // it phases in") is a person's call.
  if ((m = /^(.+?) phases? out\.$/i.exec(s)) && !/^(?:it|he|she|that \w+|they|those \w+)$/i.test(m[1])) {
    const who = m[1];
    if (who === "~") return { kind: "phase-out", target: "source" };
    if (/^equipped creature$/i.test(who)) return { kind: "phase-out", attachedToSource: true };
    if (/^all permanents you control$/i.test(who)) return { kind: "phase-out", filter: { controlledBy: "you" } };
    const got = quantifiedSlots(who, ctx);
    if (got === undefined) return null;
    const one = (target) => ({ kind: "phase-out", target });
    if (got.group) return { kind: "for-each-target", from: got.slots[0], simultaneous: true, effect: one(got.slots[0]) };
    return got.slots.length === 1 ? one(got.slots[0]) : { kind: "sequence", simultaneous: true, effects: got.slots.map(one) };
  }
  // Turning face down (rule 708.2a — the `turn-face-down` effect): "turn ~
  // face down" (Wall of Deceit), "turn target creature face down" (Cyber
  // Conversion, whose "It's a 2/2 Cyberman artifact creature" is
  // `faceDownAsAt`'s), one target, "up to one" or "any number of" them.
  if ((m = /^turn (.+?) face down\.$/i.exec(s)) && !/^(?:it|that \w+|them|those \w+)$/i.test(m[1])) {
    const who = m[1];
    if (/^~$/.test(who)) return { kind: "turn-face-down", target: "source" };
    const got = quantifiedSlots(who, ctx);
    if (got === undefined) return null;
    const one = (target) => ({ kind: "turn-face-down", target });
    if (got.group) return { kind: "for-each-target", from: got.slots[0], simultaneous: true, effect: one(got.slots[0]) };
    return got.slots.length === 1 ? one(got.slots[0]) : { kind: "sequence", simultaneous: true, effects: got.slots.map(one) };
  }
  // Turning face up by an effect (rule 708.7 — the `turn-face-up` effect):
  // "turn target face-down creature face up" (Ixidor), "… an opponent
  // controls" (Break Open), "… attacking creature you control" (Kaust).
  if ((m = /^turn target face-down( attacking)? (creature|permanent)( you control| an opponent controls)? face up\.$/i.exec(s))) {
    const whose = m[3] === undefined ? {} : { controlledBy: /you control/i.test(m[3]) ? "you" : "opponent" };
    const filter = {
      ...(m[2].toLowerCase() === "creature" ? { type: "creature" } : {}),
      faceDown: true,
      ...(m[1] !== undefined ? { attacking: true } : {}),
      ...whose,
    };
    return { kind: "turn-face-up", target: ctx.target({ kind: "permanent", filter }) };
  }
  // "You may turn a face-down creature you control face up" (Ugin's Mastery),
  // "you may turn a permanent you control face up" (Zimone): chosen as it
  // resolves, and only a face-down one could be turned.
  if ((m = /^you may turn (?:a face-down creature|a permanent) you control face up\.$/i.exec(s))) {
    const creature = /face-down creature/i.test(s);
    return {
      kind: "choose-permanents",
      filter: { ...(creature ? { type: "creature" } : {}), faceDown: true, controlledBy: "you" },
      min: 0,
      upTo: 1,
      prompt: `You may turn ${creature ? "a face-down creature" : "a permanent"} you control face up`,
      then: { kind: "turn-face-up", target: 0 },
    };
  }
  // Manifest (rule 701.40a): "manifest the top card of your library", and
  // "(you) manifest the top card of that player's library" — another
  // player's library (Thieving Amalgam, Orochi Soul-Reaver), when the
  // trigger names that player.
  // "…then put N +1/+1 counters on it / that creature / each of those
  // creatures": the cards this resolution manifested, which were put onto
  // the battlefield (rules 701.40a, 701.62a — Wildcall, Weight Room,
  // Valgavoth's Onslaught). Manifest dread N times (`count`).
  {
    const onThem = (n) => ({
      kind: "add-counter-all",
      filter: { thisWay: "put-onto-battlefield" },
      counter: "+1/+1",
      amount: numberOf(n),
    });
    if ((m = re(`manifest the top card of your library, then put ${N} \\+1/\\+1 counters? on it`).exec(s))) {
      return { kind: "sequence", effects: [{ kind: "manifest", who: "you" }, onThem(m[1])] };
    }
    if ((m = re(`manifest dread(?: ${N} times)?, then put ${N} \\+1/\\+1 counters? on (?:that creature|each of those creatures)`).exec(s))) {
      const dread = m[1] === undefined ? { kind: "manifest-dread" } : { kind: "manifest-dread", count: numberOf(m[1]) };
      return { kind: "sequence", effects: [dread, onThem(m[2])] };
    }
    if ((m = re(`manifest dread(?: ${N} times)?`).exec(s))) {
      return m[1] === undefined ? { kind: "manifest-dread" } : { kind: "manifest-dread", count: numberOf(m[1]) };
    }
  }
  if (re("manifest the top card of your library").test(s)) return { kind: "manifest", who: "you" };
  if (ctx.thatPlayer !== undefined && re("(?:you )?manifest the top card of that player's library").test(s)) {
    return { kind: "manifest", who: "you", from: ctx.thatPlayer };
  }
  // "Choose up to one target creature, then airbend all other creatures"
  // (Avatar's Wrath): every other one, together.
  if ((m = /^choose up to one target (\w+), then airbend all other (\w+)\.$/i.exec(s)) && singularTarget(m[2]) === m[1]) {
    const of = targetOf(`target ${m[1]}`);
    const filter = parseTypePhrase(m[1]);
    if (of === undefined || filter === null) return null;
    return { kind: "exile-all", filter, airbend: true, exceptTarget: ctx.target({ kind: "optional", of }) };
  }
  // "Until your next turn, your opponents can't cast spells from anywhere
  // other than their hands."
  if (re("until your next turn, your opponents can't cast spells from anywhere other than their hands").test(s)) {
    return { kind: "player-effect", duration: "until-your-next-turn", castOnlyFromHand: "each-opponent" };
  }
  // "You can cast only one more spell this turn" (Irencrag Feat).
  if ((m = re(`you can cast only ${N} more spells? this turn`).exec(s))) {
    const count = amount(m[1]);
    if (typeof count === "number") return { kind: "player-effect", duration: "end-of-turn", castsLeft: { count } };
  }
  // A flash permission for this turn (rule 601.3b): "You may cast [creature]
  // spells this turn as though they had flash" (Borne Upon a Wind, Winding
  // Canyons), and for the next matching spell, "the next sorcery spell / the
  // next spell of the chosen type you cast this turn can be cast as though
  // it had flash" (Quicken, Progenitor's Icon — `next`).
  if ((m = re("you may cast (?:(.+?) )?spells this turn as though they had flash").exec(s))) {
    const filter = flashSpellsFilter(m[1]);
    if (filter !== null) {
      return { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: filter === true ? {} : { filter } };
    }
  }
  if ((m = re("the next (?:(.+?) )?spell( of the chosen type)? you cast this turn can be cast as though it had flash").exec(s))) {
    const filter = m[2] !== undefined ? (m[1] === undefined ? { ofChosenType: true } : null) : flashSpellsFilter(m[1]);
    if (filter !== null) {
      return {
        kind: "player-effect",
        duration: "end-of-turn",
        castAsThoughFlash: filter === true ? { next: true } : { filter, next: true },
      };
    }
  }
  // A one-shot grant to the next matching spell (`grant-spells-this-turn`
  // with `next`): "the next noncreature spell you cast this turn has
  // cascade" (Dark Apostle), "the next instant or sorcery spell you cast this
  // turn can't be countered" (Overmaster), "the next spell you cast this turn
  // has convoke" (Wand of the Worldsoul), and "the next instant spell and the
  // next sorcery spell you cast this turn each have cascade" (Smoldering
  // Stagecoach — one grant each).
  if ((m = re("the next (?:(.+?) )?spell you cast this turn (has cascade|has convoke|can't be countered)").exec(s))) {
    const filter = flashSpellsFilter(m[1]);
    if (filter !== null) {
      return {
        kind: "grant-spells-this-turn",
        next: true,
        ...(filter === true ? {} : { filter }),
        ...nextSpellGrant(m[2]),
      };
    }
  }
  // "The next noncreature spell you cast this turn has affinity for
  // artifacts" (Don & Raph, Saheeli — rule 702.41a).
  if ((m = re("the next (?:(.+?) )?spell you cast this turn has affinity for (\\w+)").exec(s))) {
    const filter = flashSpellsFilter(m[1]);
    const of = parseTypePhrase(m[2]);
    if (filter !== null && of !== null && Object.keys(of).length > 0) {
      return {
        kind: "grant-spells-this-turn",
        next: true,
        ...(filter === true ? {} : { filter }),
        affinityFor: { ...of, controlledBy: "you" },
      };
    }
  }
  if ((m = re("the next (\\w+) spell and the next (\\w+) spell you cast this turn each have cascade").exec(s))) {
    if (CARD_TYPES.includes(m[1]) && CARD_TYPES.includes(m[2])) {
      return {
        kind: "sequence",
        effects: [m[1], m[2]].map((type) => ({
          kind: "grant-spells-this-turn",
          next: true,
          filter: { type },
          ...nextSpellGrant("has cascade"),
        })),
      };
    }
  }
  if ((m = re(`return (${TARGET}) to its owner's hand`).exec(s))) {
    // A spell is on the stack: "return target spell to its owner's hand"
    // (Unsubstantiate, Take It Back) takes it from there. Without `from`,
    // return-to-hand bounces a permanent and would do nothing to a spell.
    const spec = targetOf(m[1]);
    const onStack = typeof spec === "string" ? spec.endsWith("spell") : spec?.kind === "spell";
    // A card in a graveyard ("target creature card from a graveyard") comes
    // from there — without `from`, return-to-hand bounces only a permanent.
    const inGraveyard = graveyardTargetOf(m[1]) !== undefined;
    return {
      kind: "return-to-hand",
      target: slot(m[1]),
      ...(onStack ? { from: "stack" } : inGraveyard ? { from: "graveyard" } : {}),
    };
  }
  // A spell's own "return ~ to its owner's hand" (Pulse of the Fields, rule
  // 608.2n) comes from the stack, not the battlefield.
  if (re("return ~ to its owner's hand").test(s)) {
    return { kind: "return-to-hand", target: "source", ...(ctx.spell === true ? { from: "stack" } : {}) };
  }
  // "… doesn't untap during its controller's next two untap steps" (Telekinesis),
  // "during your next untap step" (Reveka): the N and whose step of `tap`'s hold.
  const heldThrough = (whose, n) => ({
    doesntUntapNext: true,
    onlyDoesntUntap: true,
    ...(n === undefined ? {} : { doesntUntapSteps: 2 }),
    ...(whose.toLowerCase() === "your" ? { untapStepOf: "you" } : {}),
  });
  const HELD = "doesn't untap during (your|its controller's) next (two )?untap steps?";
  if ((m = re(`~ ${HELD}`).exec(s))) return { kind: "tap", target: "source", ...heldThrough(m[1], m[2]) };
  if ((m = re(`(${TARGET}) ${HELD}`).exec(s))) return { kind: "tap", target: slot(m[1]), ...heldThrough(m[2], m[3]) };
  // "It" and "that creature" of the sentence before: the one target it named
  // (Samite Alchemist's "Tap that creature. It doesn't untap …"), or the
  // ability's own object (Spectral Bears' "it doesn't untap …").
  const heldObject = ctx.targets.length === 1 ? 0 : ctx.targets.length === 0 ? ctx.it : undefined;
  if (heldObject !== undefined) {
    if ((m = re(`(?:it|that creature|that land|that permanent) ${HELD}`).exec(s))) {
      return { kind: "tap", target: heldObject, ...heldThrough(m[1], m[2]) };
    }
    if (ctx.targets.length === 1 && re("tap that creature").test(s)) return { kind: "tap", target: 0 };
    if (ctx.targets.length === 1 && re("prevent all combat damage that would be dealt by that creature this turn").test(s)) {
      return { kind: "damage-rule", by: { target: 0 }, combat: true };
    }
  }
  if (re("tap ~").test(s)) return { kind: "tap", target: "source" };
  // "That player" of a trigger on someone's step (Citadel Siege): whoever's
  // step it is.
  if (ctx.thatPlayer === "active-player" && re("tap target creature that player controls").test(s)) {
    return { kind: "tap", target: ctx.target({ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }) };
  }
  if ((m = re(`tap (${TARGET})`).exec(s))) return { kind: "tap", target: slot(m[1]) };
  if ((m = re(`untap (${TARGET})`).exec(s))) return { kind: "untap", target: slot(m[1]) };
  // Detain (rule 701.35a).
  if ((m = re(`detain (${TARGET})`).exec(s))) return { kind: "detain", target: slot(m[1]) };
  if (re("untap ~").test(s)) return { kind: "untap", target: "source" };
  // Saddled (rule 702.171b) without a saddle ability: Guidelight Matrix.
  if ((m = re(`(${TARGET}) becomes saddled until end of turn`).exec(s))) {
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "become-saddled", target: i };
  }
  if (re("~ becomes saddled until end of turn").test(s)) return { kind: "become-saddled", target: "source" };
  if ((m = re(`counter (${TARGET})`).exec(s)) && !/ unless /i.test(m[1])) {
    const t = targetOf(m[1]);
    if (typeof t !== "string" || !/(spell|triggered-ability)$/.test(t)) return null;
    return { kind: "counter", target: slot(m[1]) };
  }
  if ((m = /^return (target .+? card from your graveyard) to your hand\.$/i.exec(s))) {
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "return-to-hand", target: i, from: "graveyard" };
  }
  // What a card put onto the battlefield "attached to …" enters attached to
  // (`AttachHostRef`): a creature of yours chosen as it enters, this
  // permanent, what this is attached to, or a target (a player too).
  const attachHostOf = (phrase) => {
    if (/^a creature you control$/i.test(phrase)) return { among: { type: "creature", controlledBy: "you" } };
    if (/^(?:~|this creature)$/i.test(phrase)) return "source";
    if (/^(?:enchanted|equipped) creature$/i.test(phrase)) return "attached";
    if (/^target /i.test(phrase)) return slot(phrase);
    return undefined;
  };
  // "Return target Aura or Equipment card from your graveyard to the
  // battlefield attached to a creature you control" (One Last Job); "put
  // target Aura card from a graveyard onto the battlefield under your
  // control attached to a creature you control" (Nomad Mythmaker).
  if (
    (m = /^(?:return (target .+? card from your graveyard) to the battlefield|put (target .+? card from a graveyard) onto the battlefield( under your control)?) attached to (.+?)\.$/i.exec(s))
  ) {
    const i = slot(m[1] ?? m[2]);
    if (i === undefined) return null;
    const attachedTo = attachHostOf(m[4]);
    if (attachedTo === undefined) return null;
    return { kind: "put-onto-battlefield", target: i, ...(m[3] ? { underYourControl: true } : {}), attachedTo };
  }
  // "Return target creature card … from your graveyard to the battlefield
  // and attach ~ to it" (Pre-War Formalwear): onto what was put there.
  if ((m = /^return (target .+? card from your graveyard) to the battlefield and attach ~ to it\.$/i.exec(s))) {
    const i = slot(m[1]);
    if (i === undefined) return null;
    return {
      kind: "sequence",
      effects: [
        { kind: "put-onto-battlefield", target: i },
        { kind: "attach", target: "put-this-way" },
      ],
    };
  }
  // "You may put an Aura card from your hand onto the battlefield attached to
  // ~" (Academy Researchers).
  if ((m = /^you may put an? (.+?) card from your hand onto the battlefield attached to (.+?)\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    const attachedTo = attachHostOf(m[2]);
    if (filter === null || attachedTo === undefined) return null;
    return { kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "battlefield", leftover: "stay", filter, attachedTo };
  }
  // "Search your library for a Curse card, put it onto the battlefield
  // attached to target player, then shuffle" (Bitterheart Witch); "…, put it
  // onto the battlefield, attach it to a creature you control, then shuffle"
  // (Stonehewer Giant — the host chosen as it resolves, `ontoChosen`).
  if ((m = /^search your library for an? (.+?) card, put it onto the battlefield attached to (.+?), then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    const attachedTo = attachHostOf(m[2]);
    if (filter === null || attachedTo === undefined) return null;
    return { kind: "search-library", filter, destination: "battlefield", min: 0, max: 1, attachedTo };
  }
  if ((m = /^search your library for an? (.+?) card, put it onto the battlefield, attach it to a creature you control, then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return {
      kind: "search-library",
      filter,
      destination: "battlefield",
      min: 0,
      max: 1,
      then: {
        kind: "attach",
        target: 0,
        attachment: 0,
        ontoChosen: { filter: { type: "creature", controlledBy: "you" }, prompt: "Choose a creature you control to attach it to" },
      },
    };
  }
  if ((m = /^return (target .+? card from your graveyard) to the battlefield( tapped)?\.$/i.exec(s))) {
    // An Aura put onto the battlefield this way isn't attached to anything
    // (BACKLOG), so a card that names one (Rise to Glory) is left to author.
    if (/\bAura\b/.test(m[1])) return null;
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "put-onto-battlefield", target: i, ...(m[2] ? { enterTapped: true } : {}) };
  }
  // Copying a spell (rule 707.10), with the copy's exceptions (707.9b —
  // `copyExceptOf`): "copy target creature spell you control, except it
  // isn't legendary if the spell is legendary" (Double Major); in a cast
  // trigger, "copy it / that spell, except the copy is an artifact in
  // addition to its other types" — the spell cast (Tawnos, the Toymaker).
  if ((m = /^copy (target (?:(creature|artifact|instant or sorcery|noncreature) )?spell)( you control)?(?:, except (.+?))?\.$/i.exec(s))) {
    const except = m[4] === undefined ? undefined : copyExceptOf(m[4]);
    if (except === null) return null;
    let spec;
    if (m[3] === undefined) spec = targetOf(m[1]);
    else {
      const filter = m[2] === undefined ? {} : m[2].toLowerCase() === "instant or sorcery" ? { typesAnyOf: ["instant", "sorcery"] } : m[2].toLowerCase() === "noncreature" ? { notTypes: ["creature"] } : { type: m[2].toLowerCase() };
      spec = { kind: "spell", whose: "you", filter };
    }
    if (spec === undefined) return null;
    return { kind: "copy-spell", target: ctx.target(spec), ...(except !== undefined ? { except } : {}) };
  }
  if (ctx.castSpell === true && (m = /^copy (?:it|that spell)(?:, except (.+?))?\.$/i.exec(s))) {
    const except = m[1] === undefined ? undefined : copyExceptOf(m[1]);
    if (except === null) return null;
    return { kind: "copy-spell", target: "trigger-spell", ...(except !== undefined ? { except } : {}) };
  }
  // "It gains rebound" (Taigam, Ojutai Master), "it gains bloodthirst 3"
  // (Bloodlord of Vaasgoth): on the spell, which the permanent it becomes keeps
  // (rule 400.7a).
  if (ctx.castSpell === true && (m = /^(?:it|that spell) gains (rebound|riot)\.$/i.exec(s))) {
    return { kind: "grant-keyword", target: "trigger-object", keyword: m[1].toLowerCase(), duration: "permanent" };
  }
  if (ctx.castSpell === true && (m = /^(?:it|that spell) gains bloodthirst (\d+)\.$/i.exec(s))) {
    return {
      kind: "enters-with-counters",
      target: "trigger-object",
      counter: "+1/+1",
      amount: Number(m[1]),
      ifAsItEnters: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 },
    };
  }
  // "Put target creature card from a graveyard onto the battlefield under
  // your control" (Rise from the Grave, Portal to Phyrexia).
  if ((m = /^put (target .+? card from a graveyard) onto the battlefield under your control\.$/i.exec(s))) {
    if (/\bAura\b/.test(m[1])) return null;
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "put-onto-battlefield", target: i, underYourControl: true };
  }
  // "… from an opponent's graveyard onto the battlefield tapped under your
  // control" (Geth), "…, then exile that player's graveyard" (Nurgle's
  // Conscription): the card's owner, whoever controls it by then.
  if ((m = /^put (target .+? card (?:with mana value X )?from an opponent's graveyard) onto the battlefield tapped under your control(, then exile that player's graveyard)?\.$/i.exec(s))) {
    const i = slot(m[1]);
    if (i === undefined) return null;
    const put = { kind: "put-onto-battlefield", target: i, underYourControl: true, enterTapped: true };
    return m[2] === undefined ? put : { kind: "sequence", effects: [put, { kind: "exile-graveyard", target: { ownerOfTarget: i } }] };
  }
  // "The owner of target nonland permanent shuffles it into their library,
  // then draws two cards" (Oblation).
  if ((m = new RegExp(`^the owner of (target .+?) shuffles it into their library, then draws ${N} cards?\\.$`, "i").exec(s))) {
    const i = slot(m[1]);
    return i === undefined
      ? null
      : {
          kind: "sequence",
          effects: [
            { kind: "shuffle-into-library", target: i },
            { kind: "draw", amount: amount(m[2]), who: { ownerOfTarget: i } },
          ],
        };
  }
  // "Enchanted creature deals 1 damage to its owner" (Enslave).
  if ((m = re(`enchanted creature deals ${N} damage to its owner`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), who: "attached-owner", from: "attached" };
  }
  // "Enchanted creature deals 1 damage to target creature with flying" (Dizzying
  // Gaze), "… deals damage equal to its power to any other target" (Pain for
  // All): the host the source (`DamageFrom`'s `"attached"`).
  if ((m = re(`enchanted creature deals ${N} damage to (${TARGET})`).exec(s))) {
    const target = slot(m[2]);
    if (target !== undefined) return { kind: "damage", amount: amount(m[1]), target, from: "attached" };
  }
  if (re("enchanted creature deals damage equal to its power to any other target").test(s)) {
    return {
      kind: "damage",
      amount: { powerOf: "attached" },
      target: ctx.target({ kind: "other", of: "any-target", than: "host" }),
      from: "attached",
    };
  }
  // "Exile target creature card from a graveyard. That card deals damage equal
  // to its power to ~" (Selfless Exorcist): the card in its target slot, in exile.
  if (ctx.targets.length === 1 && re("that card deals damage equal to its power to ~").test(s)) {
    return { kind: "damage", amount: { powerOf: 0 }, target: "source", from: { target: 0 } };
  }
  // "Whenever a player taps a land for mana, ~ deals 1 damage to that player"
  // (Manabarbs): the player the event names.
  if (ctx.thatPlayer === "trigger-player" && (m = re(`~ deals ${N} damage to that player`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), who: "trigger-player" };
  }
  // A second "target" tied to the first's player (Searing Blaze's shape; the
  // word twice, so one creature planeswalker may be both — rule 115.3).
  if (
    (m = re(`~ deals ${N} damage to target (player|opponent) or planeswalker and ${N} damage to (up to one )?target creature that player or that planeswalker's controller controls`).exec(s))
  ) {
    const first = ctx.target(`${m[2].toLowerCase()}-or-planeswalker`);
    const of = { kind: "other", of: "creature", than: { slot: first }, sameController: true, sameObjectAllowed: true };
    const second = ctx.target(m[4] !== undefined ? { kind: "optional", of } : of);
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: amount(m[1]), target: first },
        { kind: "damage", amount: amount(m[3]), target: second },
      ],
    };
  }
  // "Tap up to five target permanents that player controls" (Yosei): a group
  // tied to the player an earlier sentence targeted.
  if ((m = re(`tap up to ${N} target (permanents|creatures) that player controls`).exec(s))) {
    const anchor = ctx.targets.findLastIndex((t) => t === "player" || t === "opponent");
    if (anchor >= 0) {
      const of = m[2].toLowerCase() === "permanents" ? "permanent" : "creature";
      const from = ctx.target({ kind: "any-number", of, max: amount(m[1]), sameController: { slot: anchor } });
      return { kind: "for-each-target", from, simultaneous: true, effect: { kind: "tap", target: from } };
    }
  }
  // "Enchanted creature's controller": `"attached-controller"`.
  if ((m = re(`~ deals ${N} damage to enchanted (?:artifact|creature|land|permanent)'s controller`).exec(s))) {
    return { kind: "damage", amount: amount(m[1]), who: "attached-controller" };
  }
  // "Those creatures", "each of them", of an attack read as one batch: a
  // filter's `triggerBatch`.
  if (ctx.attackBatch === true) {
    const THOSE = "(?:those creatures|them)";
    if ((m = re(`those creatures get ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
      // `+ 0`: "-0" is plain 0.
      return { kind: "modify-pt-all", filter: { triggerBatch: true }, power: Number(m[1]) + 0, toughness: Number(m[2]) + 0, duration: "end-of-turn" };
    }
    if ((m = re(`(?:those creatures|they) gain ${KW} until end of turn`).exec(s))) {
      return { kind: "grant-keyword-all", filter: { triggerBatch: true }, keyword: KEYWORDS[m[1].toLowerCase()], duration: "end-of-turn" };
    }
    if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on each of ${THOSE}`).exec(s))) {
      return { kind: "add-counter-all", filter: { triggerBatch: true }, counter: m[2].toLowerCase(), amount: amount(m[1]) };
    }
    if (re(`~ deals damage to each of those creatures equal to the number of attacking creatures`).test(s)) {
      return { kind: "damage-all", filter: { triggerBatch: true }, amount: { countOf: { type: "creature", attacking: true } } };
    }
  }
  // "Creatures defending player controls get -1/-1 until end of turn"
  // (Silumgar, the Drifting Death).
  if (ctx.thatPlayer === "trigger-player" && (m = re("creatures defending player controls get ([+-]\\d+)/([+-]\\d+) until end of turn").exec(s))) {
    return {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      controlledByPlayer: "trigger-player",
      power: Number(m[1]),
      toughness: Number(m[2]),
      duration: "end-of-turn",
    };
  }
  // "Until your next turn, creatures target player controls have base power
  // and toughness 1/1" (Mass Diminish): fixed as it resolves (rule 611.2c).
  if ((m = re("until your next turn, creatures target (player|opponent) controls have base power and toughness (\\d+)/(\\d+)").exec(s))) {
    return {
      kind: "animate-all",
      filter: { type: "creature", controlledBy: "you" },
      controlledByTarget: ctx.target(m[1].toLowerCase()),
      power: Number(m[2]),
      toughness: Number(m[3]),
      duration: "until-your-next-turn",
    };
  }
  // "Each of that player's opponents" (Standstill, Heartwood Storyteller) and
  // "each of its controller's opponents" (Bounty Board): opponents of whoever
  // the trigger is about.
  if (ctx.thatPlayer === "trigger-controller") {
    if ((m = re(`each (?:of that player's opponents|other player) draws ${N} cards?`).exec(s))) {
      return { kind: "draw", amount: amount(m[1]), who: "opponents-of-trigger-controller" };
    }
    if (re("each of that player's opponents may draw a card").test(s)) {
      return {
        kind: "each-player-may",
        who: "opponents-of-trigger-controller",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      };
    }
  }
  if ((m = re(`each of its controller's opponents draws ${N} cards? and gains ${N} life`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "draw", amount: amount(m[1]), who: "opponents-of-trigger-controller" },
        { kind: "gain-life", amount: amount(m[2]), who: "opponents-of-trigger-controller" },
      ],
    };
  }
  if (ctx.thatPlayer === "active-player" && (m = re(`that player draws ${N} cards?`).exec(s))) {
    return { kind: "draw", amount: amount(m[1]), who: "active-player" };
  }
  // "… a land an opponent controls … enters, ~ deals 2 damage to that player"
  // (Invader Parasite); "… casts a … spell …, that player loses 10 life"
  // (Dragonlord Kolaghan): the trigger object's controller.
  if (ctx.thatPlayer === "trigger-controller") {
    if ((m = re(`~ deals ${N} damage to that player`).exec(s))) {
      return { kind: "damage", amount: amount(m[1]), who: "trigger-controller" };
    }
    if ((m = re(`that player loses ${N} life`).exec(s))) {
      return { kind: "lose-life", amount: amount(m[1]), who: "trigger-controller" };
    }
  }
  // Mana Flare's "that player adds one mana of any type that land produced",
  // Extraplanar Lens's "its controller adds …" (a triggered mana ability, rule
  // 605.1b).
  if (ctx.thatPlayer === "trigger-player" && re("(?:that player|its controller) adds one mana of any type that land produced").test(s)) {
    return { kind: "add-mana", mana: "produced", amount: 1 };
  }
  // "With the same name as" another named object (rule 201.2a). Remembrance's
  // and Verdant Succession's "that creature" is the one the trigger names, as
  // it last existed.
  if (ctx.it === "trigger-object" && ctx.targets.length === 0) {
    if (re("search your library for a card with the same name as that creature, reveal it, put it into your hand, then shuffle").test(s)) {
      return { kind: "search-library", filter: { sameNameAsTriggerObject: true }, destination: "hand", min: 0, max: 1, reveal: true };
    }
    if (re("that creature's controller may search their library for a card with the same name as that creature, put it onto the battlefield, then shuffle").test(s)) {
      return {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Search your library for a card with the same name as that creature and put it onto the battlefield?",
        effect: { kind: "search-library", filter: { sameNameAsTriggerObject: true }, destination: "battlefield", min: 0, max: 1 },
      };
    }
    // Eye of Singularity's "that name": the permanent the trigger names, spared.
    if (re("destroy all other permanents with that name").test(s)) {
      return { kind: "destroy-all", filter: { sameNameAsTriggerObject: true }, exceptTriggerObject: true };
    }
  }
  // Eye of Singularity's "each permanent with the same name as another
  // permanent", asked of everything before anything goes.
  if ((m = re("destroy each permanent with the same name as another permanent(, except for basic lands)?").exec(s))) {
    return { kind: "destroy-all", filter: { sameNameAsAnother: {}, ...(m[1] ? { notSupertype: "basic" } : {}) } };
  }
  if (re("exile all graveyards").test(s)) return { kind: "exile-graveyard", target: "each-player" };
  // "Exile all creature cards with mana value 3 or less from your graveyard
  // until ~ leaves the battlefield" (Idol of Endurance — rule 610.3).
  if ((m = re("exile all (.+?) cards?(?: with mana value (\\d+) or less)? from your graveyard until ~ leaves the battlefield").exec(s))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null && Object.keys(filter).length > 0) {
      return {
        kind: "exile-graveyard",
        target: "you",
        filter: { ...filter, ...(m[2] !== undefined ? { manaValue: { op: "lte", n: Number(m[2]) } } : {}) },
        untilSourceLeaves: true,
      };
    }
  }
  // "Until end of turn, you may cast a creature spell from among cards exiled
  // with ~ without paying its mana cost" (Idol of Endurance — rule 607.2a).
  if ((m = re("until end of turn, you may cast an? (.+?) spell from among cards exiled with ~( without paying its mana cost)?").exec(s))) {
    const spell = parseTypePhrase(m[1]);
    if (spell !== null && Object.keys(spell).length > 0) {
      return { kind: "allow-cast-linked-exile", spell, ...(m[2] !== undefined ? { free: true } : {}) };
    }
  }
  // "Until end of turn, you may play a card exiled with ~ [without paying its
  // mana cost]" (Raphael, Lobelia), "… play cards [you own] exiled with ~"
  // (Urianger Augurelt, Kayla's Music Box): rule 611.2c, read live.
  if ((m = re("until end of turn, you may play (a card|cards you own|cards) exiled with ~( without paying its mana cost)?").exec(s))) {
    return {
      kind: "allow-cast-linked-exile",
      ...(m[1].toLowerCase() === "cards you own" ? { spell: { ownedBy: "you" } } : {}),
      ...(m[2] !== undefined ? { free: true } : {}),
      play: true,
      ...(m[1].toLowerCase() !== "a card" ? { anyNumber: true } : {}),
    };
  }
  // Bazaar of Wonders: asked as it resolves (rule 608.2c), of the spell.
  if (re("counter it if a card with the same name is in a graveyard or a nontoken permanent with the same name is on the battlefield").test(s)) {
    return {
      kind: "conditional",
      condition: {
        kind: "any",
        of: [
          { kind: "trigger-object", filter: { sameNameWith: { graveyard: {} } } },
          { kind: "trigger-object", filter: { sameNameWith: { permanents: { token: false } } } },
        ],
      },
      then: { kind: "counter", target: "trigger-object" },
    };
  }
  // Distant Memories' any card, which it must find: a quantity, no quality (rule 701.23d).
  if (/^search your library for a card, exile it, then shuffle\.$/i.test(s)) {
    return { kind: "search-library", filter: {}, destination: "exile", min: 1, max: 1 };
  }
  // Strata Scythe's imprint: the exile is linked below, for "the exiled card".
  if ((m = /^search your library for an? (.+?) card, exile it, then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return { kind: "search-library", filter, destination: "exile", min: 0, max: 1 };
  }
  // "That player" who owned what the trigger is about (Warped Devotion,
  // Liability — `thatPlayerOf`).
  if (ctx.thatPlayer === "trigger-owner") {
    if ((m = re(`that player discards ${N} cards?`).exec(s))) {
      return { kind: "discard", target: "trigger-owner", amount: amount(m[1]) };
    }
    if ((m = re(`that player loses ${N} life`).exec(s))) {
      return { kind: "lose-life", amount: amount(m[1]), who: "trigger-owner" };
    }
  }
  if (re("sacrifice ~").test(s)) return { kind: "sacrifice-source" };
  if ((m = re(`(each player|each opponent|target player|target opponent) sacrifices ${N} (.+?)(?: of their choice)?`).exec(s))) {
    const count = amount(m[2]);
    const filter = parseTypePhrase(m[3]);
    if (typeof count !== "number" || filter === null) return null;
    const who = { "each player": "each-player", "each opponent": "each-opponent" }[m[1].toLowerCase()];
    if (who !== undefined) return { kind: "sacrifice", who, filter, count };
    // The engine reads the player from the first target, so a player named
    // after another target (Grave Exchange's card, then player) isn't read.
    if (ctx.target(targetOf(m[1])) !== 0) return null;
    return { kind: "sacrifice", who: "target", filter, count };
  }

  // Searching.
  // "A basic land card that doesn't share a land type with a land you
  // control" (Hiveheart Shaman): the land types of your lands, negated
  // (`sharesLandTypeWith: { controlled }`).
  if ((m = /^search your library for a basic land card that doesn't share a land type with a land you control, put (?:it|that card) onto the battlefield( tapped)?, then shuffle\.$/i.exec(s))) {
    const filter = { type: "land", supertype: "basic", not: { sharesLandTypeWith: { controlled: { type: "land" } } } };
    return { kind: "search-library", filter, destination: "battlefield", min: 0, max: 1, ...(m[1] ? { enterTapped: true } : {}) };
  }
  // "Search your graveyard, hand, and library for a card named X [and] put it
  // onto the battlefield, then shuffle" (Kassandra, Shaun & Rebecca): all three
  // zones, no choice of them.
  if ((m = /^search your graveyard, hand, and library for a card named (.+?)(?:,| and) put it onto the battlefield, then shuffle\.$/i.exec(s))) {
    return { kind: "search-library", zones: "graveyard-hand-library", filter: { name: m[1] }, destination: "battlefield", min: 0, max: 1 };
  }
  if ((m = /^search your library for an? (.+?) card, put it onto the battlefield( tapped)?, then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return { kind: "search-library", filter, destination: "battlefield", min: 0, max: 1, ...(m[2] ? { enterTapped: true } : {}) };
  }
  if ((m = /^search your library for an? (.+?) card, reveal it, put it into your hand, then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return { kind: "search-library", filter, destination: "hand", min: 0, max: 1, reveal: true };
  }
  // "…put it into your hand or graveyard" (Dina's Guidance): the searcher's
  // choice once it's revealed (`instead`, `pick: "any"`).
  if ((m = /^search your library for an? (.+?) card, reveal it, put it into your hand or graveyard, then shuffle\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return {
      kind: "search-library",
      filter,
      destination: "hand",
      min: 0,
      max: 1,
      reveal: true,
      instead: { destination: "graveyard", pick: "any" },
    };
  }
  if ((m = /^search your library for a card, put (?:it|that card) into your hand, then shuffle\.$/i.exec(s))) {
    // "A card", no quality: one must be found while there is one (701.23d).
    return { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 };
  }
  // A wish (rule 701.23j): from the sideboard, which is hidden, so it may
  // find nothing — Burning Wish. (Its "or choose a face-up … card you own in
  // exile" form is two sentences: `parseEffect`.)
  if ((m = /^you may reveal an? (.+?) card you own from outside the game and put it into your hand\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    return { kind: "search-library", filter, destination: "hand", min: 0, max: 1, reveal: true, outside: "only" };
  }
  // Unrevealed: Mastermind's Acquisition, North Wind Avatar, The Raven's
  // Warning's "on top of your library".
  if ((m = /^(?:you may )?put a card you own from outside the game (into your hand|on top of your library)\.$/i.exec(s))) {
    const destination = /hand/i.test(m[1]) ? "hand" : "library-top";
    return { kind: "search-library", filter: {}, destination, min: 0, max: 1, outside: "only" };
  }

  // "For as long as ~ remains tapped" (rule 611.2b — Ashnod's Battle Gear).
  if ((m = re(`(~|${TARGET}) gets ([+-]\\d+)/([+-]\\d+) for as long as ~ remains tapped`).exec(s))) {
    return {
      kind: "modify-pt",
      target: m[1] === "~" ? "source" : slot(m[1]),
      power: Number(m[2]),
      toughness: Number(m[3]),
      duration: "while-source-tapped",
    };
  }
  // Power, toughness and keywords until end of turn.
  if ((m = re(`(~|${TARGET}) gets ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    return {
      kind: "modify-pt",
      target: m[1] === "~" ? "source" : slot(m[1]),
      power: Number(m[2]),
      toughness: Number(m[3]),
      duration: "end-of-turn",
    };
  }
  if ((m = re(`(other )?creatures you control get ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    if (m[1] && !otherMeansSource(ctx)) return null;
    return {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "you" },
      power: Number(m[2]),
      toughness: Number(m[3]),
      duration: "end-of-turn",
      ...(m[1] ? { exceptSource: true } : {}),
    };
  }
  // "Can block an additional creature this turn" (Coastline Chimera, Valor
  // Made Real's "any number") — the `block-additional` effect.
  if ((m = re(`(~|${TARGET}) can block (an additional creature|any number of creatures) this turn`).exec(s))) {
    return {
      kind: "block-additional",
      target: m[1] === "~" ? "source" : slot(m[1]),
      amount: m[2] === "an additional creature" ? 1 : "any",
      duration: "end-of-turn",
    };
  }
  // A mass change of types, P/T left alone: `add-types` over a
  // `for-each-permanent`. "Become artifact creatures" keeps every type (rule
  // 205.1b), and the Vehicle's printed P/T.
  if (re("vehicles you control become artifact creatures until end of turn").test(s)) {
    return {
      kind: "for-each-permanent",
      filter: { subtype: "Vehicle", controlledBy: "you" },
      simultaneous: true,
      effect: { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
    };
  }
  if (re("lands you control gain all basic land types until end of turn").test(s)) {
    return {
      kind: "for-each-permanent",
      filter: { type: "land", controlledBy: "you" },
      simultaneous: true,
      effect: {
        kind: "add-types",
        target: 0,
        addSubtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
        duration: "end-of-turn",
      },
    };
  }
  if ((m = re("until end of turn, creatures you control get ([+-]\\d+)/([+-]\\d+) and gain all creature types").exec(s))) {
    const filter = { type: "creature", controlledBy: "you" };
    return {
      kind: "sequence",
      effects: [
        { kind: "modify-pt-all", filter, power: Number(m[1]), toughness: Number(m[2]), duration: "end-of-turn" },
        {
          kind: "for-each-permanent",
          filter,
          simultaneous: true,
          effect: { kind: "add-types", target: 0, addSubtypes: ["(every creature type)"], duration: "end-of-turn" },
        },
      ],
    };
  }
  // The Mistforms: the type chosen as it resolves replaces its creature
  // types (rule 205.1a).
  if ((m = re(`(~|${TARGET}) becomes the creature type of your choice until end of turn`).exec(s))) {
    return {
      kind: "choose-creature-type",
      then: {
        kind: "add-types",
        target: m[1] === "~" ? "source" : slot(m[1]),
        setSubtypes: ["$chosen"],
        duration: "end-of-turn",
      },
    };
  }
  // Rule 305.7: "becomes a Swamp" replaces its land types.
  if ((m = re(`(${TARGET}) becomes an? (Plains|Island|Swamp|Mountain|Forest) until end of turn`).exec(s))) {
    return { kind: "add-types", target: slot(m[1]), setSubtypes: [m[2]], duration: "end-of-turn" };
  }
  // "This token isn't a creature until end of turn" (Blink's Alien Angel).
  if ((m = re(`(~|${TARGET}) isn't an? (creature|artifact|enchantment|land) until end of turn`).exec(s))) {
    return { kind: "add-types", target: m[1] === "~" ? "source" : slot(m[1]), removeTypes: [m[2]], duration: "end-of-turn" };
  }
  // Myth Realized, Chimeric Mass, Beorn's Hospitality: a granted P/T, read live
  // (not a CDA once granted, rule 604.3a).
  if ((m = /^(until end of turn, )?~ becomes an? (.+?) creature(?: in addition to its other types)? (?:and gains|with) "This creature's power and toughness are each equal to the number of (lore counters on it|charge counters on it|lands you control|creature cards in your graveyard)\."\.?$/i.exec(s))) {
    const add = additionOf(`${m[2]} creature`);
    const counted = {
      "lore counters on it": { countersOnThis: "lore" },
      "charge counters on it": { countersOnThis: "charge" },
      "lands you control": { countOf: { type: "land", controlledBy: "you" } },
      "creature cards in your graveyard": { countInGraveyard: { type: "creature", ownedBy: "you" } },
    }[m[3]];
    if (add !== null && add.basePt === undefined && add.keywords === undefined && add.addColors === undefined) {
      const duration = m[1] !== undefined ? "end-of-turn" : "permanent";
      return {
        kind: "sequence",
        effects: [
          { kind: "animate", target: "source", addTypes: add.addTypes ?? [], addSubtypes: add.addSubtypes ?? [], duration },
          {
            kind: "grant-static",
            target: "source",
            ability: {
              affects: { scope: "self" },
              setBasePtFromCount: { countOf: counted, plusPower: 0, plusToughness: 0 },
              text: `This creature's power and toughness are each equal to the number of ${m[3]}.`,
            },
            duration,
          },
        ],
      };
    }
  }
  // Karn's Touch: its mana value read once, as the effect applies (rule 608.2h).
  if ((m = re(`(${TARGET}) becomes an artifact creature with power and toughness each equal to its mana value until end of turn`).exec(s))) {
    const target = slot(m[1]);
    return {
      kind: "animate",
      target,
      power: { manaValueOf: target },
      toughness: { manaValueOf: target },
      addTypes: ["artifact", "creature"],
      addSubtypes: [],
      duration: "end-of-turn",
    };
  }
  if ((m = re(`(~|${TARGET}) gains ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
    const target = m[1] === "~" ? "source" : slot(m[1]);
    const kws = [m[2], m[3]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    const one = (keyword) => ({ kind: "grant-keyword", target, keyword, duration: "end-of-turn" });
    return kws.length === 1 ? one(kws[0]) : { kind: "sequence", effects: kws.map(one) };
  }
  // Arcane Lighthouse's "lose hexproof and shroud and can't have hexproof or
  // shroud": the creatures there as it resolves (rule 611.2c).
  if ((m = re(`until end of turn, creatures your opponents control lose ${KW} and ${KW} and can't have ${KW} or ${KW}`).exec(s))) {
    const lost = [m[1], m[2]].map((k) => k.toLowerCase());
    if (lost[0] === m[3].toLowerCase() && lost[1] === m[4].toLowerCase()) {
      return {
        kind: "lose-keywords",
        filter: { type: "creature", controlledBy: "opponent" },
        keywords: lost.map((k) => KEYWORDS[k]),
        cantHave: true,
        duration: "end-of-turn",
      };
    }
  }
  // Losing "bands with other" (rule 702.22b) — Shelkin Brownie — and with
  // banding, which takes them too (Tolaria).
  if ((m = re(`(${TARGET}) loses (banding and )?all "bands with other" abilities until end of turn`).exec(s))) {
    return {
      kind: "lose-keywords",
      target: slot(m[1]),
      keywords: m[2] ? ["banding", "bands-with-other"] : ["bands-with-other"],
      duration: "end-of-turn",
    };
  }
  // "Creatures banded with it" (rule 702.22 — `bandedWithSource`): Icatian
  // Skirmishers, Urza's Engine.
  if ((m = re(`(all |attacking )?creatures banded with (?:it|~|this creature) gain ${KW} until end of turn`).exec(s))) {
    return {
      kind: "grant-keyword-all",
      filter: { type: "creature", ...(m[1]?.toLowerCase().startsWith("attacking") ? { attacking: true } : {}), bandedWithSource: true },
      keyword: KEYWORDS[m[2].toLowerCase()],
      duration: "end-of-turn",
    };
  }
  if ((m = re(`(other )?creatures you control gain ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
    if (m[1] && !otherMeansSource(ctx)) return null;
    const kws = [m[2], m[3]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    const one = (keyword) => ({
      kind: "grant-keyword-all",
      filter: { type: "creature", controlledBy: "you" },
      keyword,
      duration: "end-of-turn",
      ...(m[1] ? { exceptSource: true } : {}),
    });
    return kws.length === 1 ? one(kws[0]) : { kind: "sequence", effects: kws.map(one) };
  }

  // Protection for a while (rule 702.16 — the `grant-protection` effect):
  // fixed qualities, or the color (card type) of your choice, chosen as it
  // resolves.
  if ((m = re(`(~|${TARGET}) gains protection from ${PROTECTION_FROM} until (end of turn|your next turn)`).exec(s))) {
    const from = protectionFrom(m[2]);
    if (from === null) return null;
    return {
      kind: "grant-protection",
      target: m[1] === "~" ? "source" : slot(m[1]),
      from,
      duration: m[3] === "end of turn" ? "end-of-turn" : "until-your-next-turn",
    };
  }
  if ((m = re(`(choose a color\\. )?(other )?creatures you control gain protection from (the chosen color|${PROTECTION_FROM}) until end of turn`).exec(s))) {
    if (m[2] && !otherMeansSource(ctx)) return null;
    // "The chosen color" is the one this sentence's "choose a color" asks for.
    if ((m[3].toLowerCase() === "the chosen color") !== Boolean(m[1])) return null;
    const from = m[1] ? { choose: "color" } : protectionFrom(m[3]);
    if (from === null) return null;
    return {
      kind: "grant-protection",
      filter: { type: "creature", controlledBy: "you" },
      ...(m[2] ? { exceptSource: true } : {}),
      from,
      duration: "end-of-turn",
    };
  }

  // A would-deal-damage replacement for the turn (rule 614.1a) — `player-effect`'s
  // `damageReplacement`: The Flame of Keld's "if a red source you control …",
  // Rankle and Torbran's "… to a player or battle …", Equal Treatment's "1 or more".
  if ((m = /^if any source would deal 1 or more damage to a permanent or player this turn, it deals (\d+) damage to that permanent or player instead\.$/i.exec(s))) {
    return { kind: "player-effect", duration: "end-of-turn", damageReplacement: { setTo: Number(m[1]) } };
  }
  if ((m = /^if a ((?:white|blue|black|red|green) )?source( you control)? would deal (noncombat )?damage to (a permanent or player|a player or battle) this turn, it deals that much damage plus (\d+)(?: to that permanent or player)? instead\.$/i.exec(s))) {
    const colors = m[1] === undefined ? {} : { colors: [COLOR_WORD[m[1].trim().toLowerCase()]] };
    const controlled = m[2] === undefined ? {} : { controlledBy: "you" };
    const source = { ...colors, ...controlled };
    return {
      kind: "player-effect",
      duration: "end-of-turn",
      damageReplacement: {
        plus: Number(m[5]),
        ...(Object.keys(source).length > 0 ? { source } : {}),
        ...(m[3] !== undefined ? { combat: false } : {}),
        ...(m[4].toLowerCase() === "a player or battle" ? { to: "player-or-battle" } : {}),
      },
    };
  }

  // Mana.
  if ((m = /^add ((?:\{[WUBRGC]\})+)\.$/i.exec(s))) {
    const units = m[1].match(/[WUBRGC]/g);
    // One type is that type, N times; several are one of each ("Add {W}{U}"),
    // N times over when each appears N times ("{W}{W}{U}{U}").
    const types = [...new Set(units)];
    if (types.length === 1) return { kind: "add-mana", mana: units[0], amount: units.length };
    const each = units.length / types.length;
    const even = types.every((t) => units.filter((u) => u === t).length === each);
    return even
      ? { kind: "add-mana", mana: { all: types }, amount: each }
      : { kind: "add-mana", mana: { all: units }, amount: 1 };
  }
  // "Add seven {R}" (Irencrag Feat), "Add ten {W}" (Apex of Power).
  if ((m = new RegExp(`^add ${N} \\{([WUBRGC])\\}\\.$`, "i").exec(s))) {
    const n = amount(m[1]);
    if (typeof n === "number") return { kind: "add-mana", mana: m[2], amount: n };
  }
  // A choice of colour. In a mana ability the payment picks it; in an ability
  // that uses the stack (a trigger, a spell, a loyalty ability) nothing does,
  // so the choice is written out as modes.
  const choice = (colors, n) =>
    ctx.onStack
      ? {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: colors.map((c) => ({ text: `Add ${`{${c}}`.repeat(n)}.`, effect: { kind: "add-mana", mana: c, amount: n } })),
        }
      : { kind: "add-mana", mana: colors.length === 5 ? "any-color" : { oneOf: colors }, amount: n };
  if ((m = /^add \{([WUBRGC])\} or \{([WUBRGC])\}\.$/i.exec(s)) || (m = /^add \{([WUBRGC])\}, \{([WUBRGC])\}, or \{([WUBRGC])\}\.$/i.exec(s))) {
    return choice(m.slice(1).filter(Boolean), 1);
  }
  const WUBRG = ["W", "U", "B", "R", "G"];
  // A "remove any number of counters" cost's X (`removeCounter.count: "x"`):
  // "Add {B} for each storage counter removed this way" (Bottomless Vault),
  // "Add {U}, then add an additional {U} for each charge counter removed this
  // way" (Blue Mana Battery).
  if ((m = /^add \{([WUBRGC])\} for each [\w+/-]+ counter removed this way\.$/i.exec(s))) {
    return { kind: "add-mana", mana: m[1], amount: "x" };
  }
  if ((m = /^add \{([WUBRGC])\}, then add an additional \{([WUBRGC])\} for each [\w+/-]+ counter removed this way\.$/i.exec(s)) && m[1] === m[2]) {
    return { kind: "add-mana", mana: m[1], amount: { sum: [1, "x"] } };
  }
  if (/^add one mana of any color\.$/i.test(s)) return choice(WUBRG, 1);
  if ((m = new RegExp(`^add ${N} mana of any one color\\.$`, "i").exec(s))) {
    const n = amount(m[1]);
    // In a mana ability "any-color" with an amount is that much of one
    // colour (Gilded Lotus); on the stack it's a mode per colour.
    if (typeof n !== "number") return null;
    return choice(WUBRG, n);
  }

  // Regeneration, transforming, prevention (rules 701.19, 701.28, 615).
  if (re("regenerate ~").test(s)) return { kind: "regenerate", target: "source" };
  if ((m = re(`regenerate (${TARGET})`).exec(s))) return { kind: "regenerate", target: slot(m[1]) };
  if (re("transform ~").test(s)) return { kind: "transform", target: "source" };
  // "Flip this creature" (rule 710 — a flip card's normal half).
  if (re("flip (?:~|it)").test(s)) return { kind: "flip", target: "source" };
  // Becoming a copy (rules 707.2, 707.4): the source, of a target — for good
  // (rule 611.2a) or until end of turn — with "this ability" (707.9a). "Have
  // ~ become …" is what "you may" wraps; "another" target is one other than
  // the source.
  if ((m = re(`(?:~ becomes|have ~ become) a copy of (another )?(${TARGET})( until end of turn)?(, except it has this ability)?`).exec(s))) {
    const [, another, phrase, untilEndOfTurn, thisAbility] = m;
    const spec = targetOf(phrase);
    if (spec === undefined || (another && ctx.spell)) return null;
    return {
      kind: "become-copy",
      target: "source",
      of: ctx.target(another ? { kind: "other", of: spec } : spec),
      ...(untilEndOfTurn ? { until: "end-of-turn" } : {}),
      ...(thisAbility ? { exceptions: { thisAbility: THIS_ABILITY } } : {}),
    };
  }
  // An untargeted shield on the controller (rule 615.7 — `damage-rule`'s
  // amount): Conservator's "prevent the next 2 damage that would be dealt to
  // you this turn", Decorated Griffin's "… combat damage …", Festival of the
  // Guildpact's X.
  if ((m = re(`prevent the next ${N} (combat )?damage that would be dealt to you this turn`).exec(s))) {
    return { kind: "damage-rule", to: { players: "you" }, amount: amount(m[1]), ...(m[2] !== undefined ? { combat: true } : {}) };
  }
  if ((m = re(`prevent the next ${N} damage that would be dealt (?:this turn to (${TARGET})|to (${TARGET}) this turn)`).exec(s))) {
    return { kind: "prevent-damage", target: slot(m[2] ?? m[3]), amount: amount(m[1]) };
  }
  if ((m = re(`prevent all damage that would be dealt (?:this turn to (${TARGET})|to (${TARGET}) this turn)`).exec(s))) {
    return { kind: "prevent-damage", target: slot(m[1] ?? m[2]), amount: "all" };
  }
  // A redirection (rule 614.9): the en-Kor creatures, Daughter of Autumn.
  if ((m = re(`the next ${N} damage that would be dealt (?:to (~|${TARGET}) this turn|this turn to (~|${TARGET})) is dealt to (~|${TARGET}) instead`).exec(s))) {
    const from = m[2] ?? m[3];
    const target = from === "~" ? "source" : slot(from);
    const redirectTo = m[4] === "~" ? "source" : slot(m[4]);
    if (target === undefined || redirectTo === undefined) return null;
    return { kind: "prevent-damage", target, amount: amount(m[1]), redirectTo };
  }
  // A source of your choice (rule 609.7): the Circles of Protection.
  // "Of the chosen color" (Story Circle): the colour chosen as it entered.
  if ((m = re(`the next time an? (?:(white|blue|black|red|green) )?source of your choice( of the chosen color)? would deal damage to you this turn, prevent that damage`).exec(s))) {
    if (m[1] !== undefined && m[2] !== undefined) return null;
    return {
      kind: "prevent-damage-from-chosen-source",
      ...(m[1] !== undefined ? { filter: { colors: [COLOR_WORDS[m[1].toLowerCase()]] } } : {}),
      ...(m[2] !== undefined ? { filter: { ofChosenColor: true } } : {}),
      to: "you",
      amount: "next-time",
    };
  }
  // "… would deal damage this turn, prevent that damage": any recipient
  // (Pilgrim of Virtue); "to you and/or creatures you control" (Shadowbane).
  if ((m = re(`the next time an? (?:(white|blue|black|red|green) )?source of your choice would deal damage (to you and\\/or creatures you control )?this turn, prevent that damage`).exec(s))) {
    return {
      kind: "prevent-damage-from-chosen-source",
      ...(m[1] !== undefined ? { filter: { colors: [COLOR_WORDS[m[1].toLowerCase()]] } } : {}),
      to: m[2] !== undefined ? "your-side-creatures" : "any",
      amount: "next-time",
    };
  }
  // "… that damage is dealt to ~ instead" (Opal-Eye, Konda's Yojimbo): the
  // redirection, any recipient (rule 614.9).
  if ((m = re(`the next time an? (?:(white|blue|black|red|green) )?source of your choice would deal damage this turn, that damage is dealt to ~ instead`).exec(s))) {
    return {
      kind: "prevent-damage-from-chosen-source",
      ...(m[1] !== undefined ? { filter: { colors: [COLOR_WORDS[m[1].toLowerCase()]] } } : {}),
      to: "any",
      amount: "next-time",
      redirectTo: "source",
    };
  }
  // "Prevent all damage a [red] source of your choice would deal [to you]
  // this turn" (Prahv, Burrenton Forge-Tender, Auriok Replica); "prevent all
  // damage that would be dealt [to you | to any target] this turn by a source
  // of your choice" (Consulate Surveillance, Shieldmage Advocate).
  if ((m = re(`prevent all damage an? (?:(white|blue|black|red|green) )?source of your choice would deal (to you )?this turn`).exec(s))) {
    return {
      kind: "prevent-damage-from-chosen-source",
      ...(m[1] !== undefined ? { filter: { colors: [COLOR_WORDS[m[1].toLowerCase()]] } } : {}),
      to: m[2] !== undefined ? "you" : "any",
      amount: "all",
    };
  }
  if ((m = re(`prevent all damage that would be dealt (?:to (you|${TARGET}) )?this turn by a source of your choice`).exec(s))) {
    const to = m[1] === undefined ? "any" : /^you$/i.test(m[1]) ? "you" : slot(m[1]);
    if (to === undefined) return null;
    return { kind: "prevent-damage-from-chosen-source", to, amount: "all" };
  }
  // A damage rule (rule 615): "prevent all combat damage that would be dealt
  // by target attacking creature this turn" (Kor Haven), "… that would be
  // dealt to and dealt by ~ this turn" (Moonlight Geist).
  if ((m = re(`prevent all (combat )?damage that would be dealt to and dealt by (~|${TARGET}) this turn`).exec(s))) {
    const target = m[2] === "~" ? "source" : slot(m[2]);
    if (target === undefined) return null;
    const combat = m[1] ? { combat: true } : {};
    return {
      kind: "sequence",
      effects: [
        { kind: "damage-rule", to: { target }, ...combat },
        { kind: "damage-rule", by: { target }, ...combat },
      ],
    };
  }
  // "Prevent all damage that would be dealt to ~ by target creature this
  // turn" (Stonewise Fortifier).
  if ((m = re(`prevent all (combat )?damage that would be dealt to ~ by (${TARGET}) this turn`).exec(s))) {
    const target = slot(m[2]);
    if (target === undefined) return null;
    return { kind: "damage-rule", to: { target: "source" }, by: { target }, ...(m[1] ? { combat: true } : {}) };
  }
  // "The next time target creature would deal damage this turn, prevent that
  // damage" (Awe Strike — rule 615.8).
  if ((m = re(`the next time (${TARGET}) would deal damage this turn, prevent that damage`).exec(s))) {
    const target = slot(m[1]);
    if (target === undefined) return null;
    return { kind: "damage-rule", by: { target }, amount: "next-time" };
  }
  if ((m = re(`(?:prevent all (combat )?damage that would be dealt (?:this turn )?by (~|${TARGET})(?: this turn)?|prevent all (combat )?damage (~|${TARGET}) would deal this turn)`).exec(s))) {
    const phrase = m[2] ?? m[4];
    const target = phrase === "~" ? "source" : slot(phrase);
    if (target === undefined) return null;
    return { kind: "damage-rule", by: { target }, ...(m[1] || m[3] ? { combat: true } : {}) };
  }
  // Rule 615.12 (Skullcrack, Flaring Pain).
  if (re("damage can't be prevented this turn").test(s)) return { kind: "damage-cant-be-prevented" };
  // Layer 5 (the Laces): "target spell or permanent becomes black", for good.
  // "Target spell or permanent" is read only here: a bounce of one (Venser)
  // needs a step per zone.
  if ((m = re(`target spell or permanent becomes (white|blue|black|red|green)(?: \(mana symbols on that permanent remain unchanged\.\))?`).exec(s))) {
    return { kind: "become-color", target: ctx.target({ kind: "spell-or-permanent" }), colors: [COLOR_WORDS[m[1].toLowerCase()]], duration: "permanent" };
  }
  // Layer 5 "in addition" (rule 105.3 — Indigo Faerie): a colour added to
  // its others, not replacing them.
  if ((m = re(`(~|${TARGET}) becomes (white|blue|black|red|green) in addition to its other colors( until end of turn)?`).exec(s))) {
    const target = m[1] === "~" ? "source" : slot(m[1]);
    if (target === undefined) return null;
    return { kind: "become-color", target, colors: [COLOR_WORDS[m[2].toLowerCase()]], inAddition: true, duration: m[3] ? "end-of-turn" : "permanent" };
  }
  // A colour and types in addition, nothing else (Unctus, Grand Metatect's
  // "becomes a blue artifact in addition to its other colors and types"):
  // `add-types` with `addColors`.
  if ((m = re(`(until end of turn, )?(~|${TARGET}) becomes (.+?) in addition to its other colors and types( until end of turn)?`).exec(s))) {
    const add = additionOf(m[3]);
    const target =
      add === null || add.addColors === undefined || add.basePt !== undefined || add.keywords !== undefined
        ? undefined
        : m[2] === "~"
          ? "source"
          : slot(m[2]);
    if (add !== null && target !== undefined) {
      return {
        kind: "add-types",
        target,
        ...(add.addTypes !== undefined ? { addTypes: add.addTypes } : {}),
        ...(add.addSubtypes !== undefined ? { addSubtypes: add.addSubtypes } : {}),
        addColors: add.addColors,
        duration: m[1] || m[4] ? "end-of-turn" : "permanent",
      };
    }
  }
  // Layer 3 (rule 612 — Sleight of Mind, Magical Hack, Mind Bend, Crystal
  // Spray): a text change of one word for another, both chosen as it resolves.
  if ((m = re(`change the text of target (spell or permanent|permanent) by replacing all instances of one (color word with another|basic land type with another|color word with another or one basic land type with another)( until end of turn)?(?: \\(.*\\))?`).exec(s))) {
    const words = m[2].startsWith("color word with another or") ? "color-or-land-type" : m[2].startsWith("color") ? "color" : "land-type";
    return {
      kind: "change-text",
      target: ctx.target(m[1] === "permanent" ? "permanent" : { kind: "spell-or-permanent" }),
      words,
      duration: m[3] ? "end-of-turn" : "permanent",
    };
  }

  // Combat this turn.
  // Attack requirements narrowed (rule 508.1d — `attack-requirement`): one
  // target creature, at you or a target player, this turn (Alluring Siren,
  // Dulcet Sirens) or in its controller's next combat phase (Trench
  // Behemoth); a target player's creatures this turn (Imaginary Threats) or
  // during their next turn (Taunt, Gideon Jura).
  const PLAYER_T = "target (?:player|opponent)";
  if ((m = re(`(${TARGET}) attacks (you|${PLAYER_T}) this turn if able`).exec(s))) {
    const target = slot(m[1]);
    const attacks = m[2].toLowerCase() === "you" ? "you" : slot(m[2]);
    return { kind: "attack-requirement", target, attacks, duration: "this-turn" };
  }
  if ((m = re(`(${TARGET}) attacks during its controller's next combat phase if able`).exec(s))) {
    return { kind: "attack-requirement", target: slot(m[1]), duration: "controllers-next-combat" };
  }
  if ((m = re(`creatures (${PLAYER_T}) controls attack this turn if able`).exec(s))) {
    return { kind: "attack-requirement", filter: { type: "creature" }, controlledByTarget: slot(m[1]), duration: "this-turn" };
  }
  if ((m = re(`during (${PLAYER_T})'s next turn, creatures that player controls attack (you|~) if able`).exec(s))) {
    const controlledByTarget = slot(m[1]);
    return {
      kind: "attack-requirement",
      filter: { type: "creature" },
      controlledByTarget,
      attacks: m[2] === "~" ? "source" : "you",
      duration: "that-players-next-turn",
    };
  }
  // "Target creature can't block ~ this turn" (Kozilek's Pathfinder): that
  // one attacker, the source as it resolves (rule 400.7).
  if ((m = re(`(${TARGET}) can't block ~ this turn`).exec(s))) {
    return { kind: "restrict", target: slot(m[1]), restrictions: [], cantBlockAttacker: "source" };
  }
  if ((m = re(`(${TARGET}) can't block this turn`).exec(s))) return { kind: "restrict", target: slot(m[1]), restrictions: ["cant-block"] };
  // A turn-wide rule over a set of creatures (rule 611.2c — `restrict`'s
  // `filter` form): "creatures target player controls can't attack this
  // turn" (Oriss, read from that player's side — `controlledByTarget`),
  // "creatures your opponents control can't block this turn", "creatures
  // can't be blocked this turn" (Veiling Oddity).
  {
    const RESTRICTION = { attack: "cant-attack", block: "cant-block", "be blocked": "cant-be-blocked" };
    if ((m = re(`creatures (${PLAYER_T}) controls can't (attack|block|be blocked) this turn`).exec(s))) {
      return {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: slot(m[1]),
        restrictions: [RESTRICTION[m[2].toLowerCase()]],
      };
    }
    if ((m = re(`creatures( you control| your opponents control)? can't (attack|block|be blocked) this turn`).exec(s))) {
      const side = m[1] === undefined ? {} : { controlledBy: m[1] === " you control" ? "you" : "opponent" };
      return { kind: "restrict", filter: { type: "creature", ...side }, restrictions: [RESTRICTION[m[2].toLowerCase()]] };
    }
  }
  // "Target creature can't be regenerated this turn" (Hurr Jackal — rule
  // 701.19c).
  if ((m = re(`(${TARGET}) can't be regenerated this turn`).exec(s))) return { kind: "prohibit", target: slot(m[1]), regeneration: true };
  if ((m = re(`(~|${TARGET}) can't be blocked this turn`).exec(s))) {
    return { kind: "grant-keyword", target: m[1] === "~" ? "source" : slot(m[1]), keyword: "unblockable", duration: "end-of-turn" };
  }
  // "Two target creatures you control that share a creature type can't be
  // blocked this turn" (Secret Tunnel): each of the pair.
  if ((m = /^(two target .+ that share (?:a card type|a creature type|no creature types)) can't be blocked this turn\.$/i.exec(s))) {
    const got = quantifiedSlots(m[1], ctx);
    if (got === undefined || got.slots.length !== 2) return null;
    return {
      kind: "sequence",
      effects: got.slots.map((target) => ({ kind: "grant-keyword", target, keyword: "unblockable", duration: "end-of-turn" })),
    };
  }
  // "Can't be blocked by [X] this turn" — a rule on it, not an ability
  // (`restrict`'s `cantBeBlockedBy`); "except by [X]" is the negation.
  {
    const by =
      (m = re(`(~|${TARGET}) can't be blocked by creatures with power (\\d+) or (less|greater) this turn`).exec(s))
        ? { power: { op: m[3].toLowerCase() === "less" ? "lte" : "gte", n: Number(m[2]) } }
        : (m = re(`(~|${TARGET}) can't be blocked by Walls this turn`).exec(s))
          ? { subtype: "Wall" }
          : (m = re(`(~|${TARGET}) can't be blocked this turn except by creatures with (flying|haste|defender|reach)`).exec(s))
            ? { notKeyword: m[2].toLowerCase() }
            : undefined;
    if (by !== undefined) {
      return { kind: "restrict", target: m[1] === "~" ? "source" : slot(m[1]), restrictions: [], cantBeBlockedBy: by };
    }
  }
  // "You may have ~ assign its combat damage this turn as though it weren't
  // blocked" (Gurzigost), and over creatures you control (Predatory Focus):
  // the `assign-as-though-unblocked` effect.
  if (re(`you may have ~ assign its combat damage this turn as though it weren't blocked`).test(s)) {
    return { kind: "assign-as-though-unblocked", target: "source", optional: true };
  }
  if (re(`you may have creatures you control assign their combat damage this turn as though they weren't blocked`).test(s)) {
    return { kind: "assign-as-though-unblocked", filter: { type: "creature", controlledBy: "you" }, optional: true };
  }
  // Rule 701.12c: "exchange life totals with target opponent" (Mirror
  // Universe), "two target players exchange life totals" (Soul Conduit).
  if ((m = re(`exchange life totals with (${TARGET})`).exec(s))) {
    return { kind: "exchange-life-totals", second: { target: slot(m[1]) } };
  }
  if ((m = /^(you may have )?two target players exchange life totals\.$/i.exec(s))) {
    const first = ctx.target("player");
    const second = ctx.target({ kind: "other", of: "player", than: { slots: [first] } });
    const effect = { kind: "exchange-life-totals", first: { target: first }, second: { target: second } };
    return m[1] ? { kind: "may", prompt: "Have those players exchange life totals?", effect } : effect;
  }
  // Rule 701.12g: "exchange your life total with this creature's toughness"
  // (Tree of Redemption), "with Evra's power", "exchange target opponent's
  // life total with …" (Tree of Perdition).
  if ((m = re(`exchange your life total with ~'s (power|toughness)`).exec(s))) {
    return { kind: "exchange-life-stat", stat: m[1].toLowerCase(), target: "source" };
  }
  if ((m = re(`exchange (${TARGET})'s life total with ~'s (power|toughness)`).exec(s))) {
    return { kind: "exchange-life-stat", stat: m[2].toLowerCase(), target: "source", player: { target: slot(m[1]) } };
  }
  // Rule 701.12b: two permanents change hands at once, all or nothing.
  if ((m = re(`exchange control of ~ and (${TARGET})`).exec(s))) {
    return { kind: "exchange-control", objects: ["source", slot(m[1])] };
  }
  // "Exchange control of two target permanents that share a card type"
  // (Shifting Loyalties) — the pair `quantifiedSlots` reads.
  if ((m = /^exchange control of (two target .+ that share a card type)\.$/i.exec(s))) {
    const got = quantifiedSlots(m[1], ctx);
    return got === undefined || got.slots.length !== 2 ? null : { kind: "exchange-control", objects: got.slots };
  }
  // "Exchange control of target artifact or creature and another target
  // permanent that shares one of those types with it" (Legerdemain): the
  // second slot shares with the first one of the card types it names
  // (`shares` with `among`), or any card type.
  if ((m = re(`exchange control of (${TARGET}) and (?:another )?target (.+?) that shares (one of those types|a card type) with it`).exec(s))) {
    const first = slot(m[1]);
    const of = targetOf(`target ${m[2]}`);
    // "Target artifact, creature, or land [you control]": the card types it
    // names (Gauntlets of Chaos).
    const CARD_TYPES = ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"];
    const words = m[1]
      .replace(/^target /i, "")
      .replace(/ (?:you control|an opponent controls|you don't control)$/i, "")
      .split(/,? or |, /);
    const named = words.every((w) => CARD_TYPES.includes(w)) ? words : undefined;
    const among = /^one/i.test(m[3]) ? named : null;
    if (first === undefined || of === undefined || among === undefined) return null;
    const shares = { kind: "card", ...(among !== null ? { among } : {}) };
    const second = ctx.target({ kind: "other", of, than: { slot: first }, shares });
    return { kind: "exchange-control", objects: [first, second] };
  }
  if ((m = re(`exchange control of (${TARGET}) and (${TARGET})`).exec(s))) {
    return { kind: "exchange-control", objects: [slot(m[1]), slot(m[2])] };
  }

  // "Gets +N/+N and gains <keyword> until end of turn" — two instructions on one object.
  if ((m = re(`(~|${TARGET}) gets ([+-]\\d+)/([+-]\\d+) and gains ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
    const target = m[1] === "~" ? "source" : slot(m[1]);
    const kws = [m[4], m[5]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target, power: Number(m[2]), toughness: Number(m[3]), duration: "end-of-turn" },
        ...kws.map((keyword) => ({ kind: "grant-keyword", target, keyword, duration: "end-of-turn" })),
      ],
    };
  }

  // Base power or base toughness alone (layer 7b, rule 613.4b — `animate`
  // with only a `power` or a `toughness`): Island of Wak-Wak's "target
  // creature with flying has base power 0 until end of turn", Turtle-Duck's
  // "until end of turn, ~ has base power 4 and gains trample", Chariot of the
  // Sun's "until end of turn, target creature you control gains flying and
  // has base toughness 1", Riptide Mangler's "~'s base power becomes equal to
  // target creature's power" and Wall of Tombstones' "~'s base toughness
  // becomes equal to 1 plus the number of creature cards in your graveyard"
  // (both indefinitely).
  {
    const baseOne = (who, which, value, keywords, duration) => {
      const target = who === "~" ? "source" : slot(who);
      if (target === undefined || value === null) return null;
      const kws = keywords.filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
      return {
        kind: "animate",
        target,
        [which.toLowerCase()]: value,
        addTypes: [],
        addSubtypes: [],
        ...(kws.length > 0 ? { keywords: kws } : {}),
        duration,
      };
    };
    // The keyword form first: a lazy target phrase would otherwise swallow
    // "target creature gains flying and" as the target.
    let b;
    let r = null;
    if ((b = re(`until end of turn, (~|${TARGET}) gains ${KW} and has base (power|toughness) (\\d+)`).exec(s))) {
      r = baseOne(b[1], b[3], Number(b[4]), [b[2]], "end-of-turn");
    } else if ((b = re(`(~|${TARGET}) has base (power|toughness) (\\d+) until end of turn`).exec(s))) {
      r = baseOne(b[1], b[2], Number(b[3]), [], "end-of-turn");
    } else if ((b = re(`until end of turn, (~|${TARGET}) has base (power|toughness) (\\d+)(?: and gains ${KW})?`).exec(s))) {
      r = baseOne(b[1], b[2], Number(b[3]), [b[4]], "end-of-turn");
    }
    if (r !== null) return r;
    if ((b = re(`~'s base (power|toughness) becomes equal to (?:(\\w+) plus )?(.+?)(?: \\(This effect lasts indefinitely\\.\\))?`).exec(s))) {
      const plus = b[2] === undefined ? 0 : numberOf(b[2]);
      let value = null;
      const of = /^(target creature)'s power$/i.exec(b[3]);
      const grave = /^the number of (.+?) cards in your graveyard$/i.exec(b[3]);
      if (of !== null) value = { powerOf: slot(of[1]) };
      else if (grave !== null) {
        const filter = parseTypePhrase(grave[1]);
        value = filter === null ? null : { countInGraveyard: { ...filter, ownedBy: "you" } };
      } else value = dividedTotalOf(b[3]);
      if (value !== null && typeof plus === "number") {
        return baseOne("~", b[1], plus === 0 ? value : { sum: [plus, value] }, [], "permanent");
      }
    }
  }
  // Rule 613.4d: a switch, applied in layer 7d.
  if ((m = re(`switch (~|${TARGET})'s power and toughness until end of turn`).exec(s))) {
    return { kind: "switch-pt", target: m[1] === "~" ? "source" : slot(m[1]), duration: "end-of-turn" };
  }
  if (re(`switch each creature's power and toughness until end of turn`).test(s)) {
    return { kind: "switch-pt", all: { type: "creature" }, duration: "end-of-turn" };
  }
  // "Target opponent exiles a card from their hand" — their choice, from
  // their own hand (`for-each-player` about the target).
  if ((m = re(`(target player|target opponent) exiles (a|two|three) cards? from their hand`).exec(s))) {
    const n = amount(m[2]);
    return {
      kind: "for-each-player",
      who: { target: slot(m[1]) },
      effect: { kind: "look-and-choose", player: "that-player", zone: "hand", min: n, max: n, destination: "exile", unlinked: true, leftover: "stay" },
    };
  }

  // Everyone's creatures until end of turn.
  if ((m = re(`all creatures get ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    return { kind: "modify-pt-all", filter: { type: "creature" }, power: Number(m[1]), toughness: Number(m[2]), duration: "end-of-turn" };
  }
  if ((m = re(`creatures your opponents control get ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    return {
      kind: "modify-pt-all",
      filter: { type: "creature", controlledBy: "opponent" },
      power: Number(m[1]),
      toughness: Number(m[2]),
      duration: "end-of-turn",
    };
  }
  if ((m = re(`~ deals ${N} damage to each creature( without flying)? and each player`).exec(s))) {
    // One event (Pestilence; Earthquake, Flamebreak "without flying"): the
    // creatures and the players are dealt it at once.
    const n = amount(m[1]);
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage-all", filter: m[2] ? { type: "creature", notKeyword: "flying" } : { type: "creature" }, amount: n },
        { kind: "damage", amount: n, who: "each-player" },
      ],
    };
  }
  if ((m = re(`~ deals ${N} damage to you`).exec(s))) return { kind: "damage", amount: amount(m[1]), who: "you" };

  // Damage and life together (Lightning Helix): two instructions.
  if ((m = re(`~ deals ${N} damage to (${TARGET}) and you gain ${N} life`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: amount(m[1]), target: slot(m[2]) },
        { kind: "gain-life", amount: amount(m[3]) },
      ],
    };
  }
  // "This creature deals 2 damage to any target and 3 damage to itself" (Psionic
  // Entity), both at once; "… 2 damage to itself" (Goblin Bangchuckers); "that
  // artifact deals damage equal to its mana value to this creature" (Goblin
  // Tinkerer): the source, untargeted.
  if ((m = re(`~ deals ${N} damage to (${TARGET}) and ${N} damage to itself`).exec(s))) {
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: amount(m[1]), target: slot(m[2]) },
        { kind: "damage", amount: amount(m[3]), target: "source" },
      ],
    };
  }
  if ((m = re(`~ deals ${N} damage to itself`).exec(s))) return { kind: "damage", amount: amount(m[1]), target: "source" };
  if (ctx.targets.length === 1 && re("that (?:artifact|creature|enchantment|permanent) deals damage equal to its mana value to ~").test(s)) {
    return { kind: "damage", amount: { manaValueOf: 0 }, target: "source", from: { target: 0 } };
  }
  if ((m = re(`~ deals ${N} damage to (${TARGET}) and ${N} damage to you`).exec(s))) {
    // One instruction: both are dealt at once (rule 120.3, one damage event).
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: amount(m[1]), target: slot(m[2]) },
        { kind: "damage", amount: amount(m[3]), who: "you" },
      ],
    };
  }
  if ((m = re(`~ deals ${N} damage to each creature without flying`).exec(s))) {
    return { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: amount(m[1]) };
  }
  if (re("the Ring tempts you").test(s)) return { kind: "the-ring-tempts-you" };
  if ((m = re(`empower Jace ${N}`).exec(s))) return { kind: "empower-jace", amount: amount(m[1]) };
  // Rule 722.3a — "… becomes prepared".
  if (re("~ becomes prepared").test(s)) return { kind: "become-prepared", target: "source" };
  if (re("each creature you control becomes prepared").test(s)) {
    return { kind: "become-prepared", filter: { type: "creature", controlledBy: "you" } };
  }
  if ((m = re(`(${TARGET}) becomes prepared`).exec(s))) return { kind: "become-prepared", target: slot(m[1]) };
  if (re("~ connives").test(s)) return { kind: "connive", target: "source" };
  if (re("~ explores").test(s)) return { kind: "explore", target: "source" };
  // Incubate N (rule 701.53a) — a fixed N.
  if ((m = re("incubate (\\d+)").exec(s))) return { kind: "incubate", amount: Number(m[1]) };
  // Discover N (rule 701.57a) — a fixed N; "discover X, where X is …" is a person's.
  if ((m = re("discover (\\d+)").exec(s))) return { kind: "discover", amount: Number(m[1]) };
  if ((m = re(`(${TARGET}) explores, then it explores again`).exec(s))) {
    return { kind: "explore", target: slot(m[1]), times: 2 };
  }
  if ((m = re(`(${TARGET}) explores`).exec(s))) return { kind: "explore", target: slot(m[1]) };
  if ((m = re(`put (target card from a graveyard) on the bottom of its owner's library`).exec(s))) {
    return { kind: "put-on-library", target: slot(m[1]), position: "bottom" };
  }

  // Life, in the shapes the pool writes it.
  if ((m = re(`you lose ${N} life`).exec(s))) return { kind: "lose-life", amount: amount(m[1]) };
  if ((m = re(`each player loses ${N} life`).exec(s))) return { kind: "lose-life", amount: amount(m[1]), who: "each-player" };
  if ((m = re(`(target player|target opponent) loses ${N} life and you gain ${N} life`).exec(s))) {
    return {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: amount(m[2]), target: slot(m[1]) },
        { kind: "gain-life", amount: amount(m[3]) },
      ],
    };
  }
  if ((m = re(`you draw a card and you lose ${N} life`).exec(s))) {
    return { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: amount(m[1]) }] };
  }
  if (re("draw a card at the beginning of the next turn's upkeep").test(s)) {
    return { kind: "delayed-trigger", at: "next-upkeep", effect: { kind: "draw", amount: 1 }, text: "Draw a card." };
  }

  // Counterspells with a tax (Mana Leak): the spell's controller decides.
  if ((m = /^counter (target spell|target creature spell|target noncreature spell|target instant or sorcery spell) unless its controller pays ((?:\{\d+\})+)\.$/i.exec(s))) {
    const i = slot(m[1]);
    return { kind: "unless", chooser: i, options: [{ pay: m[2], text: `Pay ${m[2]}` }], otherwise: { kind: "counter", target: i } };
  }
  // An `unless` with a payment of its own kind (rule 118.12a): mana and life
  // together (Mundungu), energy (Rush of Inspiration), returning or tapping a
  // permanent (Karoo, Command Bridge), sacrificing the target (Enchanter's Bane).
  if ((m = /^counter (target spell|target creature spell|target noncreature spell) unless its controller pays ((?:\{\d+\})+) and (\d+) life\.$/i.exec(s))) {
    const i = slot(m[1]);
    return {
      kind: "unless",
      chooser: i,
      options: [{ pay: m[2], andLife: Number(m[3]), text: `Pay ${m[2]} and ${m[3]} life` }],
      otherwise: { kind: "counter", target: i },
    };
  }
  // Keldon Twilight's "that player": the one whose end step it is.
  if (/^that player sacrifices a creature of their choice that they controlled since the beginning of the turn\.$/i.test(s)) {
    return { kind: "sacrifice", who: "active-player", filter: { type: "creature", controlledContinuously: true }, count: 1 };
  }
  // Rocket Launcher, Crazed Armodon.
  if (/^destroy ~ at the beginning of the next end step\.$/i.test(s)) {
    return { kind: "delayed-trigger", at: "next-end-step", text: "Destroy ~.", effect: { kind: "destroy", target: "source" } };
  }
  // "Then discard a card unless you attacked this turn" (Chart a Course),
  // "… unless there are five or more mana values among cards in your
  // graveyard" (Tainted Indulgence): any condition the intervening-ifs read.
  if ((m = /^(?:then )?discard a card unless (.+)\.$/i.exec(s))) {
    const condition = INTERVENING_IFS[`if ${m[1].toLowerCase()},`];
    if (condition !== undefined) {
      return { kind: "conditional", condition: { kind: "not", of: condition }, then: { kind: "discard", target: "you", amount: 1 } };
    }
  }
  if ((m = /^(?:then )?discard a card at random unless you pay ((?:\{E\})+)\.$/i.exec(s))) {
    return {
      kind: "unless",
      chooser: "you",
      options: [{ payEnergy: m[1].length / "{E}".length, text: `Pay ${m[1]}` }],
      otherwise: { kind: "discard", target: "you", amount: 1, random: true },
    };
  }
  if ((m = /^sacrifice (?:~|it) unless you (return|tap) (an? untapped (.+?)) you control(?: to its owner's hand)?\.$/i.exec(s))) {
    const toHand = /to its owner's hand\.$/i.test(s);
    const filter = parseTypePhrase(m[3]);
    if (filter !== null && (m[1].toLowerCase() === "return") === toHand) {
      const permanents = { ...filter, controlledBy: "you", tapped: false };
      const text = `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]} you control${toHand ? " to its owner's hand" : ""}`;
      return {
        kind: "unless",
        chooser: "you",
        options: [toHand ? { returnToHand: permanents, text } : { tapPermanent: permanents, text }],
        otherwise: { kind: "sacrifice-source" },
      };
    }
  }
  // An `unless` whose way out is an effect of its own (`doing`), "you" in it
  // being its chooser: Grip of Amnesia, Perplex. Answered by "you", it's a
  // `may` with an `else`: Hidden Horror, Cursed Monstrosity.
  if ((m = /^counter target spell unless its controller (exiles all cards from their graveyard|discards their hand)\.$/i.exec(s))) {
    const i = slot("target spell");
    const exiles = m[1].startsWith("exiles");
    return {
      kind: "unless",
      chooser: i,
      options: [
        exiles
          ? { doing: { kind: "exile-graveyard", target: "you" }, text: "Exile all cards from your graveyard" }
          : { doing: { kind: "discard", target: "you", amount: { cardsInHand: "you" } }, text: "Discard your hand" },
      ],
      otherwise: { kind: "counter", target: i },
    };
  }
  if ((m = /^sacrifice (?:~|it) unless you discard an? (.+?) card\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null) {
      return {
        kind: "may",
        prompt: `Discard a ${m[1]} card?`,
        effect: { kind: "discard", target: "you", amount: 1, filter },
        else: { kind: "sacrifice-source" },
      };
    }
  }
  if ((m = /^(target enchantment|target artifact|target creature) deals damage equal to its mana value to its controller unless that player sacrifices it\.$/i.exec(s))) {
    const i = slot(m[1]);
    return {
      kind: "unless",
      chooser: i,
      options: [{ sacrificeThat: i, text: "Sacrifice it" }],
      otherwise: { kind: "damage", amount: { manaValueOf: i }, toControllerOfTarget: i, from: { target: i } },
    };
  }

  // Libraries and graveyards.
  // Several cards into their owners' libraries at once, each owner
  // arranging theirs (rule 401.4): "put two target lands on top of their
  // owners' libraries" (Plow Under), "put any number of target creature
  // cards from your graveyard on top of your library" (Forever Young), "put
  // all enchantments on top of their owners' libraries" (Harmonic
  // Convergence).
  if ((m = /^put ((?:two|three|any number of|up to (?:two|three|four|five)) target .+?) on (top|the bottom) of (?:their owners'|your) librar(?:y|ies)\.$/i.exec(s))) {
    const from = libraryPlacementSlot(m[1], ctx);
    if (from === undefined) return null;
    return { kind: "put-on-libraries", what: { targetsFrom: from }, position: m[2].toLowerCase() === "top" ? "top" : "bottom" };
  }
  if ((m = /^put all (.+?) on (top|the bottom) of their owners' libraries\.$/i.exec(s))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { kind: "put-on-libraries", what: { all: filter }, position: m[2].toLowerCase() === "top" ? "top" : "bottom" };
  }
  if ((m = re(`put (${TARGET}) on top of its owner's library`).exec(s))) {
    return { kind: "put-on-library", target: slot(m[1]), position: "top" };
  }
  // The owner's choice of where (Misleading Motes, Lost Days).
  if (
    (m =
      re(`(${TARGET})'s owner puts it on their choice of the top or bottom of their library`).exec(s) ??
      re(`the owner of (${TARGET}) puts it on their choice of the top or bottom of their library`).exec(s))
  ) {
    return { kind: "put-on-library", target: slot(m[1]), position: { ownerChooses: ["top", "bottom"] } };
  }
  if ((m = re(`the owner of (${TARGET}) puts it into their library second from the top or on the bottom`).exec(s))) {
    return { kind: "put-on-library", target: slot(m[1]), position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } };
  }
  if (re("exile target card from a graveyard").test(s)) {
    return { kind: "exile", target: ctx.target({ kind: "card-in-graveyard", whose: "any" }) };
  }

  // "Enchanted creature gains hexproof until end of turn" (Starlit Mantle):
  // the permanent this Aura or Equipment is attached to as the effect
  // resolves — the `"attached"` reference — read as "it" is read, after every
  // template above that names it itself. Anything no "it" template takes
  // falls through to the rest.
  // …and as the object: "tap enchanted creature" (Bitter Chill), "exile
  // enchanted creature" (Dreadful Apathy).
  if ((m = re("(tap|untap|exile|destroy) (?:enchanted|equipped) (?:creature|permanent)").exec(s))) {
    return { kind: m[1].toLowerCase(), target: "attached" };
  }
  if (ctx.it !== "attached" && ctx.targets.length === 0 && (m = /^(?:enchanted|equipped) (?:creature|permanent) (.+)$/i.exec(s))) {
    const asIt = parseSentence(`it ${m[1]}`, { ...ctx, it: "attached" });
    if (asIt !== null) return asIt;
  }
  // "The chosen creature" (`choosePermanentOnEnter` — the `"chosen"`
  // reference): "sacrifice the chosen creature" (Tyrannical Pitlord), "the
  // chosen creature gains indestructible until end of turn" (Dauntless
  // Bodyguard), read as "it" is.
  if (re("sacrifice the chosen (?:creature|permanent)").test(s)) return { kind: "sacrifice-target", target: "chosen" };
  if (ctx.it !== "chosen" && ctx.targets.length === 0 && (m = /^the chosen (?:creature|permanent) (.+)$/i.exec(s))) {
    const asIt = parseSentence(`it ${m[1]}`, { ...ctx, it: "chosen" });
    if (asIt !== null) return asIt;
  }
  // "That player returns a creature they control to its owner's hand"
  // (Sunken Hope), "that player untaps a land they control" (Hokori, Dust
  // Drinker), "defending player chooses an untapped creature they control"
  // isn't read: what follows is the card's. The player the trigger names
  // chooses (`chooser`) — not a target — from their own.
  if (ctx.thatPlayer !== undefined && (m = re("(?:that|defending) player (returns|untaps|taps) (?:a|an) (.+?) they control( to its owner's hand)?").exec(s))) {
    const verb = m[1].toLowerCase();
    const untapped = verb === "taps" && /^untapped /.test(m[2]);
    const filter = parseTypePhrase(untapped ? m[2].slice("untapped ".length) : m[2]);
    if (filter !== null && (verb === "returns") === (m[3] !== undefined)) {
      const then = verb === "returns" ? { kind: "return-to-hand", target: 0 } : { kind: verb === "untaps" ? "untap" : "tap", target: 0 };
      return {
        kind: "choose-permanents",
        chooser: ctx.thatPlayer,
        filter: { ...filter, controlledBy: "you", ...(untapped ? { tapped: false } : {}) },
        min: 1,
        upTo: 1,
        then,
        prompt: `${m[1][0].toUpperCase()}${m[1].slice(1, -1)} ${/^[aeiou]/i.test(m[2]) ? "an" : "a"} ${m[2]} you control${m[3] ?? ""}`,
      };
    }
  }

  // "It": the object the ability is about — its source, or the object its
  // trigger names — and only while nothing has been targeted, which "it"
  // could mean instead.
  const it = ctx.targets.length === 0 ? ctx.it : undefined;
  if (it !== undefined) {
    // "That creature" of a `deals-damage` trigger: what the damage was dealt
    // to (`"trigger-recipient"`, `itOf`) — "destroy that creature at end of
    // combat" a delayed trigger that keeps it (603.7c, Ohran Viper).
    if (it === "trigger-recipient") {
      if ((m = re("(destroy|exile) that creature at end of combat").exec(s))) {
        const word = m[1].toLowerCase();
        return {
          kind: "delayed-trigger",
          at: "end-of-combat",
          effect: { kind: word, target: it },
          text: `${word.charAt(0).toUpperCase()}${word.slice(1)} that creature.`,
        };
      }
      if ((m = re("(destroy|exile) that creature").exec(s))) return { kind: m[1].toLowerCase(), target: it };
      if (re("tap that creature and it doesn't untap during its controller's next untap step").test(s)) {
        return { kind: "tap", target: it, doesntUntapNext: true };
      }
      if (re("tap that creature").test(s)) return { kind: "tap", target: it };
      if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on that creature`).exec(s))) {
        return { kind: "add-counter", target: it, counter: m[2].toLowerCase(), amount: amount(m[1]) };
      }
      if (re("that creature becomes a copy of ~").test(s)) return { kind: "become-copy", target: it, of: "source" };
      if (re("that creature doesn't untap during its controller's untap step for as long as ~ remains on the battlefield").test(s)) {
        return { kind: "restrict", target: it, restrictions: ["doesnt-untap"], duration: "while-source" };
      }
    }
    // "It deals 1 damage to the player or planeswalker it's attacking" (Rakdos
    // Roustabout): the attack's recipient, nothing once it's out of combat.
    if (it === "source" && (m = re(`it deals ${N} damage to the player or planeswalker it's attacking`).exec(s))) {
      return {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { attacking: true } },
        then: { kind: "damage", amount: amount(m[1]), toTriggerRecipient: true },
      };
    }
    // A damage source is only the ability's own or the trigger's object
    // (`DamageFrom`): "enchanted creature deals …" has no shape.
    // "It deals 1 damage to each creature blocking it" (Battle-Scarred
    // Goblin — `blockingRelation`), and when "it" is the object the trigger
    // names, it deals the damage too (Trailblazer's Torch).
    if ((it === "source" || it === "trigger-object") && (m = re(`it deals ${N} damage to each (${BLOCK_RELATION})`).exec(s))) {
      const filter = blockRelationFilterOf(m[2], it);
      return filter === undefined ? null : { kind: "damage-all", amount: amount(m[1]), filter, ...(it === "source" ? {} : { from: it }) };
    }
    // "Each creature blocking it gets -1/-1 until end of turn" (Plague Wight).
    if ((it === "source" || it === "trigger-object") && (m = re(`each (${BLOCK_RELATION}) gets ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
      const filter = blockRelationFilterOf(m[1], it);
      return filter === undefined ? null : { kind: "modify-pt-all", filter, power: Number(m[2]), toughness: Number(m[3]), duration: "end-of-turn" };
    }
    // "Defending player sacrifices a creature of their choice that's blocking
    // it" (Labyrinth Raptor), the player the attacker's blocked-trigger names.
    if ((it === "source" || it === "trigger-object") && re("defending player sacrifices a creature of their choice that's blocking it").test(s)) {
      return { kind: "sacrifice", who: "trigger-player", filter: blockRelationFilterOf("creature blocking it", it), count: 1 };
    }
    // "Sacrifice it" (Ib Halfheart), the object the trigger names: only while
    // it's still that object and still yours (rules 400.7, 701.21a).
    if (it === "trigger-object" && re("sacrifice it").test(s)) return { kind: "sacrifice-target", target: it };
    // "It gets +1/+1 until end of turn for each creature blocking it" (Elvish
    // Berserker, General Marhault Elsdragon), "that Sliver gets …" (Spined
    // Sliver), "… for each creature it's blocking" (Guardian of the Gateless).
    if ((it === "source" || it === "trigger-object") && (m = re(`(?:it|that [A-Z][a-z]+) gets ([+-]\\d+)/([+-]\\d+) until end of turn for each creature (blocking it|it's blocking)`).exec(s))) {
      const each =
        m[3] === "blocking it"
          ? { blockersOf: it }
          : { countOf: { type: "creature", blockingRelation: { relation: "blocked-by", ...(it === "source" ? {} : { of: it }) } } };
      const times = (n) => (n === 0 ? 0 : n === 1 ? each : { product: [n, each] });
      return { kind: "modify-pt", target: it, power: times(Number(m[1])), toughness: times(Number(m[2])), duration: "end-of-turn" };
    }
    // "Put a +1/+1 counter on that Hero for each creature blocking it"
    // (She-Hulk, Wallbreaker).
    if ((it === "source" || it === "trigger-object") && (m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on (?:it|that [A-Z][a-z]+) for each creature blocking it`).exec(s))) {
      const n = amount(m[1]);
      return { kind: "add-counter", target: it, counter: m[2].toLowerCase(), amount: n === 1 ? { blockersOf: it } : { product: [n, { blockersOf: it }] } };
    }
    // "It deals 1 damage to each opponent" (Zhur-Taa Druid).
    if (it === "source" && (m = re(`it deals ${N} damage to each opponent`).exec(s))) {
      return { kind: "damage", amount: amount(m[1]), who: "each-opponent" };
    }
    // "Whenever a land is tapped for mana, return it to its owner's hand"
    // (Storm Cauldron): a permanent still there, not one that has left.
    if (it === "trigger-object" && ctx.departed === undefined && re("return it to its owner's hand").test(s)) {
      return { kind: "return-to-hand", target: it };
    }
    if ((it === "source" || it === "trigger-object") && (m = re(`it deals ${N} damage to (${TARGET})`).exec(s))) {
      return { kind: "damage", amount: amount(m[1]), target: slot(m[2]), ...(it === "source" ? {} : { from: it }) };
    }
    if ((m = re(`it gets ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
      return { kind: "modify-pt", target: it, power: Number(m[1]), toughness: Number(m[2]), duration: "end-of-turn" };
    }
    if (re(`switch its power and toughness until end of turn`).test(s)) {
      return { kind: "switch-pt", target: it, duration: "end-of-turn" };
    }
    if ((m = re(`it gains ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
      const kws = [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
      const one = (keyword) => ({ kind: "grant-keyword", target: it, keyword, duration: "end-of-turn" });
      return kws.length === 1 ? one(kws[0]) : { kind: "sequence", effects: kws.map(one) };
    }
    if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on it`).exec(s))) {
      return { kind: "add-counter", target: it, counter: m[2].toLowerCase(), amount: amount(m[1]) };
    }
    if ((m = re(`remove all (?:([+-]\\d+/[+-]\\d+|[a-z]+) )?counters from it`).exec(s))) {
      return { kind: "remove-counter", target: it, counter: m[1]?.toLowerCase() ?? "any", amount: "all" };
    }
    if (re("untap it").test(s)) return { kind: "untap", target: it };
    if (re("tap it").test(s)) return { kind: "tap", target: it };
    if (re("it becomes saddled until end of turn").test(s)) return { kind: "become-saddled", target: it };
    if (re("airbend (?:it|that creature|that permanent)").test(s)) return { kind: "exile", target: it, airbend: true };
    if (re("it connives").test(s)) return { kind: "connive", target: it };
    // Explore (rule 701.44a), once, twice or X times.
    if (re("it explores, then it explores again").test(s)) return { kind: "explore", target: it, times: 2 };
    if ((m = re(`it explores ${N} times`).exec(s))) return { kind: "explore", target: it, times: amount(m[1]) };
    if (re("it explores").test(s)) return { kind: "explore", target: it };
    // "He phases out" (Kaito Shizuki), "it phases out" (rule 702.26b).
    if (re("(?:it|he|she) phases out").test(s)) return { kind: "phase-out", target: it };
    // "Return it to the battlefield face down under your control" (Ashcloud
    // Phoenix), "… under your control face down and tapped" (Missy), "…
    // face down under its owner's control" (Yedora): entering face down
    // (rule 708.3), with what it is (708.2) from `faceDownAsAt`'s next
    // sentence. A card in a graveyard or exile only — the trigger's object.
    if (
      it === "trigger-object" &&
      (m = re("return it to the battlefield (?:under (your|its owner's) control )?face down( and tapped)?(?: under (your|its owner's) control)?").exec(s)) &&
      !(m[1] !== undefined && m[3] !== undefined)
    ) {
      const whose = (m[1] ?? m[3] ?? "its owner's").toLowerCase();
      return {
        kind: "put-onto-battlefield",
        target: it,
        ...(whose === "your" ? { underYourControl: true } : {}),
        ...(m[2] !== undefined ? { enterTapped: true } : {}),
        faceDown: true,
      };
    }
    if (re("turn it face down").test(s)) return { kind: "turn-face-down", target: it };
    if (re("turn it face up(?: if it's face down)?").test(s)) return { kind: "turn-face-up", target: it };
  }

  // Everything else that's a whole instruction by itself.
  if (re("you become the monarch").test(s)) return { kind: "become-monarch" };
  // "Target opponent becomes the monarch" (Jared Carthalion, True Heir).
  if ((m = re("(target player|target opponent) becomes the monarch").exec(s))) return { kind: "become-monarch", who: slot(m[1]) };
  // "You can't become the monarch this turn" (rule 725.4).
  if (re("you can't become the monarch this turn").test(s)) return { kind: "prohibit", who: "you", monarch: true };
  // "Target player can't play lands this turn" (Turf Wound, Pardic Miner —
  // rule 305.2).
  if ((m = re("(target player|target opponent|you) can't play lands this turn").exec(s))) {
    return m[1].toLowerCase() === "you"
      ? { kind: "prohibit", who: "you", lands: true }
      : { kind: "prohibit", who: slot(m[1]), lands: true };
  }
  // The initiative (rule 726) — its abilities venture into Undercity — and
  // venturing (701.49): into one of the three Forgotten Realms dungeons.
  if (re("you take the initiative").test(s)) return { kind: "take-initiative" };
  if (re("venture into the dungeon").test(s)) return { kind: "venture" };
  if (re("venture into undercity").test(s)) return { kind: "venture", into: "undercity" };
  // Bolster N (rule 701.39a): on a creature of yours with the least toughness.
  if ((m = re("bolster (\\d+)").exec(s))) return { kind: "bolster", amount: Number(m[1]) };
  // Blight N (rule 701.68a): you, or each opponent, each on a creature of theirs.
  if ((m = re("blight (\\d+)").exec(s))) return { kind: "blight", amount: Number(m[1]) };
  if ((m = re("each (opponent|player) blights (\\d+)").exec(s))) {
    return { kind: "blight", amount: Number(m[2]), who: m[1] === "opponent" ? "each-opponent" : "each-player" };
  }
  if ((m = re("target (opponent|player) blights (\\d+)").exec(s))) {
    return { kind: "blight", amount: Number(m[2]), who: { target: ctx.target(m[1]) } };
  }
  // Behold (rule 701.4a): reveal one from your hand or choose one you control.
  if ((m = re("behold (.+)").exec(s)) && beholdOf(m[1]) !== null) {
    const { filter, text, count } = beholdOf(m[1]);
    return { kind: "behold", filter, text, ...(count !== undefined ? { count } : {}) };
  }
  // "You get {E}{E}." (rule 122.1 — energy counters).
  if ((m = re("you get ((?:\\{E\\})+)").exec(s))) return { kind: "get-energy", amount: m[1].length / 3 };

  // "You may <sentence>." wraps whatever the inner sentence is.
  if ((m = /^you may (.+)\.$/i.exec(s))) {
    const inner = parseSentence(`${m[1][0].toUpperCase()}${m[1].slice(1)}.`, ctx);
    if (inner === null) return null;
    // A search's `min: 0` lets it find nothing, but it still searches and
    // shuffles: "you may search" is a `may` like any other, asked as
    // "Search your library for …?".
    const asked = inner.kind === "search-library" ? m[1].replace(/,.*$/, "") : m[1];
    return { kind: "may", prompt: `${asked[0].toUpperCase()}${asked.slice(1)}?`, effect: inner };
  }
  return null;
}

/**
 * An effect's text as one `EffectSpec`: every sentence must parse (then it's
 * that effect, or a `sequence`). Otherwise `effect: null`, with the sentences
 * left to author in `todo` and what the others became in `hints`.
 */
/**
 * A permission's window as Oracle text words it (`play`: "you may play"
 * rather than "you may cast"), or `null` for one not read here.
 */
function impulseWindowOf(sentence) {
  const verb = "(play|cast)";
  const it = "(?:it|that card|them|those cards)";
  const words = [
    [`you may ${verb} ${it} this turn`, { duration: "end-of-turn" }],
    [`until end of turn, you may ${verb} ${it}`, { duration: "end-of-turn" }],
    [`until your next turn, you may ${verb} ${it}`, { duration: "until-your-next-turn" }],
    [`until the beginning of your next upkeep, you may ${verb} ${it}`, { duration: "until-your-next-upkeep" }],
    [
      `until your next turn, you may ${verb} ${it} if it's an instant or sorcery spell`,
      { duration: "until-your-next-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
    ],
    [`you may ${verb} ${it} until the end of your next turn`, { duration: "your-next-turn" }],
    [`until the end of your next turn, you may ${verb} ${it}`, { duration: "your-next-turn" }],
    [
      `until the end of your next turn, you may ${verb} ${it} and you may spend mana as though it were mana of any color to cast that spell`,
      { duration: "your-next-turn", spendAs: "any-color" },
    ],
    [`during your next turn, you may ${verb} ${it}`, { duration: "your-next-turn-only" }],
    [`until end of combat on your next turn, you may ${verb} ${it}`, { duration: "until-end-of-combat-your-next-turn" }],
    [`you may ${verb} ${it} until you exile another card with ~`, { duration: "until-next-exile" }],
    [`you may ${verb} ${it} for as long as you control ~`, { duration: "while-you-control" }],
    [`during any turn you attacked with ~, you may ${verb} ${it}`, { duration: "while-exiled", sourceDid: "attacked" }],
    [`during any turn you put a lore counter on ~, you may ${verb} ${it}`, { duration: "while-exiled", sourceDid: "lore-counter" }],
  ];
  for (const [pattern, window] of words) {
    const m = new RegExp(`^${pattern}\\.$`, "i").exec(sentence);
    if (m !== null) return { ...window, play: m[1].toLowerCase() === "play" };
  }
  return null;
}

/** "Exile target nonland permanent. For as long as that card remains exiled,
 * its owner may play it[. A spell cast (by an opponent) this way costs {N} more
 * to cast]." (Soul Partition), "… may cast it without paying its mana cost"
 * (Release to the Wind): `exile`'s `mayCast` with `byOwner`, and how many
 * sentences it took — or `null`. */
function ownerPermissionAt(sentences, i, ctx) {
  const exile = /^exile (up to one )?target ([a-z' ]+?)\.$/i.exec(sentences[i]);
  const said = /^for as long as that card remains exiled, its owner may (play|cast) it( without paying its mana cost)?\.$/i.exec(
    sentences[i + 1] ?? "",
  );
  if (exile === null || said === null) return null;
  const spec = targetOf(`target ${exile[2]}`);
  if (spec === undefined) return null;
  const tax = /^a spell cast( by an opponent)? this way costs \{(\d+)\} more to cast\.$/i.exec(sentences[i + 2] ?? "");
  return {
    effect: {
      kind: "exile",
      target: ctx.target(exile[1] !== undefined ? { kind: "optional", of: spec } : spec),
      mayCast: {
        duration: "while-exiled",
        ...(said[1].toLowerCase() === "play" ? { play: true } : {}),
        byOwner: true,
        ...(said[2] !== undefined ? { free: true } : {}),
        ...(tax !== null
          ? { tax: { generic: Number(tax[2]), ...(tax[1] !== undefined ? { opponentsOnly: true } : {}) } }
          : {}),
      },
    },
    used: tax !== null ? 3 : 2,
  };
}

/** The impulse sentence pair at `i`, or `null`: the top card exiled with its
 * permission (`impulse-exile`), or a targeted card exiled from your graveyard
 * with one (`exile`'s `mayCast`; `sourceDid` isn't something that says). */
function impulseWindowAt(sentences, i, ctx) {
  const next = sentences[i + 1];
  if (next === undefined) return null;
  const window = impulseWindowOf(next);
  if (window === null) return null;
  const { play, ...when } = window;
  if (/^exile the top card of your library\.$/i.test(sentences[i])) {
    return { kind: "impulse-exile", amount: 1, ...when, ...(play ? {} : { castOnly: true }) };
  }
  // Only the windows new to `exile`: the plain "this turn" reads go on through
  // whatever else those lines say.
  if (window.sourceDid !== undefined || window.filter !== undefined) return null;
  // "Exile target creature. Until the end of your next turn, you may cast that
  // card and you may spend mana as though …" (Hurl Through Hell).
  const permanent = window.spendAs !== undefined ? /^exile target ([a-z' ]+?)\.$/i.exec(sentences[i]) : null;
  const onBattlefield = permanent === null ? undefined : targetOf(`target ${permanent[1]}`);
  if (onBattlefield !== undefined) {
    return { kind: "exile", target: ctx.target(onBattlefield), mayCast: { duration: when.duration, spendAs: when.spendAs } };
  }
  const graveyard = /^exile (up to one )?target (?:(.+?) )?card from your graveyard\.$/i.exec(sentences[i]);
  if (graveyard === null) return null;
  const filter = graveyard[2] === undefined ? {} : parseTypePhrase(graveyard[2], { cards: true });
  if (filter === null) return null;
  const spec = { kind: "card-in-graveyard", whose: "you", ...(Object.keys(filter).length > 0 ? { filter } : {}) };
  return {
    kind: "exile",
    target: ctx.target(graveyard[1] !== undefined ? { kind: "optional", of: spec } : spec),
    mayCast: {
      duration: when.duration,
      ...(play ? { play: true } : {}),
      ...(when.spendAs !== undefined ? { spendAs: when.spendAs } : {}),
    },
  };
}

/**
 * An exchange of life totals with a clause of its own, read whole: Mister
 * Negative's "If you lost life this way" and Psychic Transfer's "if the
 * difference … is 5 or less".
 */
function lifeExchanges(text, ctx) {
  if (/^you may exchange life totals with target opponent\. If you lost life this way, draw that many cards\.$/i.test(text)) {
    const opponent = ctx.target(targetOf("target opponent"));
    return {
      kind: "may",
      prompt: "Exchange life totals with that opponent?",
      effect: { kind: "exchange-life-totals", second: { target: opponent } },
      then: { kind: "draw", amount: { lifeLostThisWay: true, who: "you" } },
    };
  }
  const m = /^If the difference between your life total and target player's life total is (\d+) or less, exchange life totals with that player\.$/.exec(text);
  if (m) {
    const player = ctx.target(targetOf("target player"));
    return {
      kind: "conditional",
      condition: { kind: "player-compare", stat: "life", compare: "within", by: Number(m[1]), than: { target: player } },
      then: { kind: "exchange-life-totals", second: { target: player } },
    };
  }
  return null;
}

/**
 * "Each player chooses a creature they control. Destroy the rest" (Divine
 * Reckoning): a `vote` with `choose`, then a `destroy-all` of what wasn't chosen
 * (`notThisWay: "chosen"`). "Destroy each permanent chosen this way" (Druid of
 * Purification) is the same `vote` read the other way round.
 */
function chosenAndTheRest(text) {
  const COUNTS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const destroyRest = (kept, words) => {
    const rest = words === undefined ? kept : parseTypePhrase(words.replace(" and ", " or "));
    return rest === null ? null : { kind: "destroy-all", filter: { ...rest, notThisWay: "chosen" } };
  };
  const chooseThenRest = (vote, kept, words) => {
    const destroy = destroyRest(kept, words);
    return destroy === null ? null : { kind: "sequence", effects: [{ kind: "vote", choose: true, ...vote }, destroy] };
  };
  let m;
  if (text === "Choose a nonland permanent you don't control, then each other player chooses a nonland permanent they don't control that hasn't been chosen this way. Destroy all other nonland permanents.") {
    const permanent = { permanent: { notTypes: ["land"], controlledBy: "opponent", notThisWay: "chosen" }, own: true, keep: true };
    return chooseThenRest({ startingWith: "you-then-active-player", for: permanent }, { notTypes: ["land"] }, undefined);
  }
  if ((m = /^Each player chooses (an?|two|three|four|five|six) (.+?) they control\. Destroy (?:the rest|all other (.+))\.$/.exec(text))) {
    const kept = parseTypePhrase(m[2]);
    if (kept === null) return null;
    const count = COUNTS[m[1]];
    const permanent = { permanent: { ...kept, controlledBy: "you" }, own: true, ...(count > 1 ? { count } : {}), keep: true };
    return chooseThenRest({ for: permanent }, kept, m[3]);
  }
  if ((m = /^Choose (up to one|up to two|up to three|an?) (.+?)(?:\. Destroy|, then destroy) (?:the rest|all other (.+))\.$/.exec(text))) {
    const kept = parseTypePhrase(m[2]);
    if (kept === null) return null;
    const upTo = m[1].startsWith("up to") ? COUNTS[m[1].slice("up to ".length)] : undefined;
    const permanent = { permanent: kept, ...(upTo !== undefined ? { upTo } : {}), keep: true };
    return chooseThenRest({ who: "you", for: permanent }, kept, m[3]);
  }
  if ((m = /^starting with you, each player may choose an? (.+?) you don't control\. Destroy each permanent chosen this way\.$/i.exec(text))) {
    const chosen = parseTypePhrase(m[1]);
    if (chosen === null) return null;
    return {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, startingWith: "you", for: { permanent: { ...chosen, controlledBy: "opponent" }, upTo: 1 } },
        { kind: "destroy-all", filter: { thisWay: "chosen" } },
      ],
    };
  }
  return null;
}

/**
 * The whole effects where each player in turn pays or bids an amount of their
 * choosing: `players-pay-any-amount` (join forces' total as `"x"`, or what each
 * paid) and `bid-life`, the high bidder its `"that-player"` and the bid its `"x"`.
 */
function paidAndBid(text, ctx) {
  const m = /^(?:Starting with you, each player|[Ee]ach player starting with you) may pay any amount of mana\. (.+), where X is the total amount of mana paid this way\.$/.exec(text);
  if (m) {
    const rest = m[1];
    let then = parseSentence(`${rest}.`, ctx);
    let part;
    if ((part = /^Each player creates X (.+? creature) tokens$/.exec(rest))) {
      const token = ctx.tokenFor?.(`${part[1]} token`);
      then = token ? { kind: "create-token", token, count: "x", who: "each-player" } : null;
    } else if (/^Each player mills X cards$/.test(rest)) {
      then = { kind: "mill", target: "each-player", amount: "x" };
    } else if (/^~ gets \+X\/\+0 until end of turn$/.test(rest)) {
      then = { kind: "modify-pt", target: "source", power: "x", toughness: 0, duration: "end-of-turn" };
    }
    return then == null ? null : { kind: "players-pay-any-amount", resource: "mana", startingWithYou: true, then };
  }
  const liege = /^[Ee]ach player may pay any amount of mana\. Then each player creates a number of (.+? creature) tokens equal to the amount of mana they paid this way\.$/.exec(text);
  if (liege) {
    const token = ctx.tokenFor?.(`${liege[1]} token`);
    if (!token) return null;
    return {
      kind: "players-pay-any-amount",
      resource: "mana",
      each: { kind: "create-token", token, count: "x", who: "that-player" },
    };
  }
  const vermin = /^Starting with you, each player may pay any amount of life\. Repeat this process until no one pays life\. Each player creates a (.+? creature) token for each 1 life they paid this way\.$/.exec(text);
  if (vermin) {
    const token = ctx.tokenFor?.(`${vermin[1]} token`);
    if (!token) return null;
    return {
      kind: "players-pay-any-amount",
      resource: "life",
      startingWithYou: true,
      untilNoOnePays: true,
      each: { kind: "create-token", token, count: "x", who: "that-player" },
    };
  }
  const BIDDING = "In turn order, each player may top the high bid\\. The bidding ends if the high bid stands\\. The high bidder loses life equal to the high bid";
  const loses = { kind: "lose-life", amount: "x", who: "that-player" };
  if (new RegExp(`^Each player may bid life for control of target creature\\. You start the bidding with a bid of 0\\. ${BIDDING} and gains control of the creature\\.$`).test(text)) {
    const creature = ctx.target(targetOf("target creature"));
    return {
      kind: "bid-life",
      who: "each-player",
      opening: 0,
      then: {
        kind: "sequence",
        effects: [loses, { kind: "gain-control", target: creature, untilEndOfTurn: false, who: "that-player" }],
      },
    };
  }
  if (new RegExp(`^Each player may bid life\\. You start the bidding with a bid of any number\\. ${BIDDING} and draws four cards\\.$`).test(text)) {
    return {
      kind: "bid-life",
      who: "each-player",
      opening: "any",
      then: { kind: "sequence", effects: [loses, { kind: "draw", amount: 4, who: "that-player" }] },
    };
  }
  if (new RegExp(`^You and target spell's controller bid life\\. You start the bidding with a bid of 1\\. ${BIDDING}\\. If you win the bidding, counter that spell\\.$`).test(text)) {
    const spell = ctx.target(targetOf("target spell"));
    return {
      kind: "bid-life",
      who: { youAndControllerOfTarget: spell },
      opening: 1,
      then: loses,
      ifYouWin: { kind: "counter", target: spell },
    };
  }
  return null;
}

/**
 * The whole effects a number a player chooses runs through: a `vote` of `for: {
 * number }`, read by `{ votedNumber }` and the `voted-number` condition, or a
 * `choose-value` of a number read as `"x"`. Each is one card's wording, its parts
 * too interlinked to read a sentence at a time.
 */
/**
 * A private look at another player's top card with something to do to it: "you
 * may put that card into their graveyard" (Draugr Thought-Thief), "on the bottom
 * of that player's library" (Coral Fighters), a "you may look" around it
 * (Precognition), or a payment for it (Wand of Denial: nothing moves until it's
 * paid, so `destination: "stay"` and a `then`).
 */
function looksAtAnothersTop(text, ctx) {
  // "Look at the top three cards of target player's library. Put one back and
  // the rest into that player's graveyard." (Dimir Charm).
  const putBack =
    /^Look at the top (two|three|four|five) cards of (target player|target opponent)'s library\. Put one back and the rest into that player's graveyard\.$/.exec(
      text,
    );
  if (putBack !== null) {
    return {
      kind: "look-and-choose",
      from: { target: ctx.target(targetOf(putBack[2])) },
      zone: "library",
      count: { two: 2, three: 3, four: 4, five: 5 }[putBack[1]],
      min: 1,
      max: 1,
      destination: "library-top",
      leftover: "graveyard",
    };
  }
  const m =
    /^(You may look|Look) at the top card of (target player|target opponent|defending player)'s library\. (?:If you do, you may put that card (on the bottom of that player's library|into (?:that player's|their) graveyard)|You may put that card (on the bottom of that player's library|into (?:that player's|their) graveyard)|If it's a nonland card, you may pay (\d+) life\. If you do, put it into that player's graveyard)\.$/i.exec(
      text,
    );
  if (m === null) return null;
  const optional = /^you may/i.test(m[1]);
  // "If you do, you may…" is only ever after a "you may look".
  if (optional !== (m[3] !== undefined)) return null;
  const from = m[2] === "defending player" ? "trigger-player" : { target: ctx.target(targetOf(m[2])) };
  const where = m[3] ?? m[4];
  const look =
    where !== undefined
      ? {
          kind: "look-and-choose",
          from,
          zone: "library",
          count: 1,
          min: 0,
          max: 1,
          destination: where.startsWith("on the bottom") ? "library-bottom" : "graveyard",
          leftover: "stay",
        }
      : {
          kind: "look-and-choose",
          from,
          zone: "library",
          count: 1,
          min: 1,
          max: 1,
          filter: { notTypes: ["land"] },
          destination: "stay",
          leftover: "stay",
          then: {
            kind: "may",
            prompt: `Pay ${m[5]} life to put that card into its owner's graveyard?`,
            costLife: Number(m[5]),
            effect: { kind: "put-into-graveyard", target: 0 },
          },
        };
  return optional ? { kind: "may", prompt: "Look at the top card of that opponent's library?", effect: look } : look;
}

function chosenNumbers(text, ctx) {
  if (/^Target opponent chooses a number\. You may have that player lose that much life\. If you don't, that player sacrifices all but that many permanents of their choice\.$/.test(text)) {
    const opponent = ctx.target(targetOf("target opponent"));
    const that = { target: opponent };
    return {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, who: that, for: { number: {} } },
        {
          kind: "may",
          prompt: "Have that player lose that much life? If you don't, they sacrifice all but that many permanents.",
          effect: { kind: "lose-life", amount: { votedNumber: opponent }, who: that },
          else: { kind: "sacrifice-all-but", who: that, keep: { votedNumber: opponent }, filter: {} },
        },
      ],
    };
  }
  const highest = { kind: "voted-number", who: "that-player", is: "highest" };
  if (/^Each player secretly chooses a number\. Then those numbers are revealed\. Each player with the highest number loses that much life\. If you are one of those players, put two \+1\/\+1 counters on ~\.$/.test(text)) {
    return {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, secret: true, for: { number: {} } },
        {
          kind: "for-each-player",
          who: "each-player",
          whoIf: highest,
          simultaneous: true,
          effect: { kind: "lose-life", amount: { votedNumber: "highest" }, who: "that-player" },
        },
        {
          kind: "conditional",
          condition: { kind: "voted-number", who: "you", is: "highest" },
          then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
        },
      ],
    };
  }
  if (/^Each player secretly chooses a number 0 or greater, then all players reveal those numbers simultaneously and determine the highest and lowest numbers revealed this way\. ~ deals damage equal to the highest number to each player who chose that number\. Each player who didn't choose the lowest number discards their hand, then draws seven cards\.$/.test(text)) {
    const notLowest = { kind: "not", of: { kind: "voted-number", who: "that-player", is: "lowest" } };
    return {
      kind: "sequence",
      effects: [
        { kind: "vote", choose: true, secret: true, for: { number: { min: 0 } } },
        { kind: "damage", amount: { votedNumber: "highest" }, who: "each-player", whoseIf: highest },
        {
          kind: "for-each-player",
          who: "each-player",
          whoIf: notLowest,
          simultaneous: true,
          effect: { kind: "discard-hand", who: "that-player" },
        },
        {
          kind: "for-each-player",
          who: "each-player",
          whoIf: notLowest,
          effect: { kind: "draw", amount: 7, who: "that-player" },
        },
      ],
    };
  }
  if (/^(?:It|~) deals an amount of damage of your choice to you and target creature\. The damage can't be prevented\.$/.test(text)) {
    const creature = ctx.target(targetOf("target creature"));
    return {
      kind: "choose-value",
      value: "number",
      min: 0,
      prompt: "How much damage?",
      then: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: "x", who: "you", cantBePrevented: true },
          { kind: "damage", amount: "x", target: creature, cantBePrevented: true },
        ],
      },
    };
  }
  if (/^Each player shuffles their hand and graveyard into their library\. You exile the top ten cards of your library\. Then each player draws up to seven cards\.$/.test(text)) {
    return {
      kind: "sequence",
      effects: [
        { kind: "shuffle-graveyard-into-library", target: "each-player", zones: ["hand", "graveyard"] },
        { kind: "exile-from-library", amount: 10 },
        {
          kind: "for-each-player",
          who: "each-player",
          effect: {
            kind: "choose-value",
            value: "number",
            who: "that-player",
            min: 0,
            max: 7,
            prompt: "How many cards do you draw?",
            then: { kind: "draw", amount: "x", who: "that-player" },
          },
        },
      ],
    };
  }
  // Stalking Leonin: kept on the permanent, hidden until a cost reveals it.
  const secretly = /^Secretly choose (an opponent|a player)\.$/.exec(text);
  if (secretly !== null) {
    return {
      kind: "choose-opponent",
      ...(secretly[1] === "a player" ? { anyPlayer: true } : {}),
      remember: true,
      secret: true,
      then: { kind: "sequence", effects: [] },
    };
  }
  // Stalking Leonin's reveal: the target's whoever's, read as it resolves.
  const stalked = /^Exile target creature that's attacking you if it's controlled by the chosen player\.$/.exec(text);
  if (stalked !== null) {
    return {
      kind: "conditional",
      condition: {
        kind: "target",
        index: ctx.target({ kind: "permanent", filter: { type: "creature", attackingYou: true } }),
        filter: { controlledBy: "chosen-player" },
      },
      then: { kind: "exile", target: 0 },
    };
  }
  // Shapeshifter's: the answer kept on the permanent, a line of its P/T reading it.
  const again = /^You may choose a number between (\d+) and (\d+)\.$/.exec(text);
  if (again !== null) {
    return {
      kind: "may",
      prompt: `Choose a new number between ${again[1]} and ${again[2]}?`,
      effect: {
        kind: "choose-value",
        value: "number",
        min: Number(again[1]),
        max: Number(again[2]),
        remember: true,
        then: { kind: "sequence", effects: [] },
      },
    };
  }
  // Liquid Fire: the number is its `additionalCost.chooseNumber`, read as X.
  const fire = /^~ deals X damage to target creature and (\d+) minus X damage to that creature's controller, where X is the chosen number\.$/.exec(text);
  if (fire !== null) {
    const creature = ctx.target(targetOf("target creature"));
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: "x", target: creature },
        {
          kind: "damage",
          amount: { sum: [Number(fire[1]), { product: ["x", -1] }] },
          who: { controllerOfTarget: creature },
        },
      ],
    };
  }
  return null;
}

/**
 * A step and the "When you do, …" after it, whose effect names what the step
 * made, returned or targeted (the `reflexive-trigger`'s `about`, rule 603.12),
 * as the step's effect and the reflexive one; `null` when either isn't read.
 * The reflexive ability's targets are its own, so they don't take a slot of
 * the creating ability's.
 */
function reflexiveAboutAt(sentences, i, ctx) {
  const clause = /^When you do, (.+\.)$/.exec(sentences[i + 1] ?? "");
  if (clause === null) return null;
  const slots = ctx.targets.length;
  const step = parseSentence(sentences[i], ctx);
  const about = step === null || step === undefined ? undefined : reflexiveAbout(step, clause[1]);
  const read = about === undefined ? null : reflexiveClause(clause[1]);
  if (read === null) {
    ctx.targets.length = slots;
    return null;
  }
  return [step, { kind: "reflexive-trigger", about, targets: read.targets, effect: read.effect, text: sentences[i + 1] }];
}

/**
 * "You may pay {1}{W} any number of times. When you pay this cost one or more
 * times, put that many valor counters on this creature." (Intrepid Adversary;
 * "up to three times", `maxX`): a `may` whose `cost` is paid a chosen number of
 * times, and the reflexive ability that triggers once (rule 603.12a), reading
 * that number as X. Its effect takes no target here, so it takes no slot of
 * the creating ability's: a clause with one, or "choose up to that many"'s
 * modes, is left to be authored. `null` when not read whole.
 */
function payTimesAt(sentences, i, ctx) {
  const pay = /^you may pay ((?:\{[^}]+\})+) (any number of times|up to (one|two|three|four|five) times?)\.$/i.exec(sentences[i] ?? "");
  const clause = /^when you pay this cost one or more times, (.+\.)$/i.exec(sentences[i + 1] ?? "");
  if (pay === null || clause === null) return null;
  const slots = ctx.targets.length;
  const text = clause[1].replace(/\bthat many\b/gi, "X");
  const effect = parseSentence(`${text[0].toUpperCase()}${text.slice(1)}`, ctx);
  if (effect === null || containsUndefined(effect) || ctx.targets.length !== slots || !JSON.stringify(effect).includes('"x"')) {
    ctx.targets.length = slots;
    return null;
  }
  const most = pay[3] === undefined ? undefined : ["one", "two", "three", "four", "five"].indexOf(pay[3].toLowerCase()) + 1;
  return {
    kind: "may",
    prompt: `Pay ${pay[1]} ${pay[2].toLowerCase()}?`,
    cost: pay[1],
    costTimes: true,
    ...(most !== undefined ? { maxX: most } : {}),
    effect: { kind: "reflexive-trigger", targets: [], effect, text: sentences[i + 1].replaceAll("~", "this creature") },
  };
}

/** What a "When you do" clause's "it", "that token" or "that creature" means
 * after `step`: its token, the card it returned, or the host it named. */
function reflexiveAbout(step, clause) {
  if (step.kind === "put-onto-battlefield") return /^it /.test(clause) ? "put-this-way" : undefined;
  if (step.kind !== "create-token") return undefined;
  if (/^that creature /.test(clause)) return typeof step.attachedTo === "number" ? step.attachedTo : undefined;
  return /\b(it|that token)\b/.test(clause) ? "created" : undefined;
}

/** The templates of a "When you do" clause reading its `about`. */
function reflexiveClause(clause) {
  const opponentCreature = { kind: "permanent", whose: "opponent", filter: { type: "creature" } };
  if (clause === "attach it to target creature you control.") {
    return {
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "trigger-object" },
    };
  }
  if (/^(it|that creature) fights up to one target creature you don't control\.$/.test(clause)) {
    return {
      targets: [{ kind: "optional", of: opponentCreature }],
      effect: { kind: "fight", a: "trigger-object", b: 0 },
    };
  }
  if (clause === "return up to one target Aura or Equipment card from your graveyard to the battlefield attached to that token.") {
    return {
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { subtypes: ["Aura", "Equipment"] } } }],
      effect: { kind: "put-onto-battlefield", target: 0, attachedTo: "trigger-object" },
    };
  }
  return null;
}

/** The "spend this mana only" lines that name a `ManaSpendPurpose`, as their
 * `spendOnly`. A list, not a grammar: the printed lines are few and worded
 * every way. */
const MANA_SPEND_PURPOSE_LINES = {
  "Spend this mana only to cast a spell from your graveyard.": { castFrom: { zones: ["graveyard"], yours: true } },
  "Spend this mana only to cast spells from exile.": { castFrom: { zones: ["exile"] } },
  "Spend this mana only to cast spells with flashback from a graveyard.": {
    castFrom: { zones: ["graveyard"], withFlashback: true },
  },
  "Spend this mana only to cast a spell from anywhere other than your hand.": { castFrom: { notZones: ["hand"] } },
  "Spend this mana only to cast kicked spells.": { purposes: ["kicked-spell"] },
  "Spend this mana only to cast an instant or sorcery spell or a kicked spell.": {
    spell: { typesAnyOf: ["instant", "sorcery"] },
    purposes: ["kicked-spell"],
  },
  "Spend this mana only to cast creature spells with no abilities.": {
    spell: { type: "creature", hasAbilities: false },
  },
  "Spend this mana only to turn permanents face up.": { purposes: ["turn-face-up"] },
  "Spend this mana only to cast an enchantment spell, unlock a door, or turn a permanent face up.": {
    spell: { type: "enchantment" },
    purposes: ["unlock-door", "turn-face-up"],
  },
  "Spend this mana only to cast Room spells and unlock doors.": {
    spell: { subtype: "Room" },
    purposes: ["unlock-door"],
  },
  "Spend this mana only to pay a disturb cost or cast an instant or sorcery spell.": {
    spell: { typesAnyOf: ["instant", "sorcery"] },
    purposes: ["disturb"],
  },
  "Spend this mana only to cast an Equipment spell or activate an equip ability.": {
    spell: { subtype: "Equipment" },
    purposes: ["equip-ability"],
  },
  "Spend this mana only to cast Equipment spells or activate equip abilities.": {
    spell: { subtype: "Equipment" },
    purposes: ["equip-ability"],
  },
  "Spend this mana only to activate power-up abilities.": { purposes: ["power-up-ability"] },
  "Spend this mana only to cast an instant or sorcery spell or to gain a Class level.": {
    spell: { typesAnyOf: ["instant", "sorcery"] },
    purposes: ["class-level"],
  },
  "Spend this mana only on costs that contain {X}.": { purposes: ["cost-with-x"] },
  "Spend this mana only to cast a spell that's one or more colors without {X} in its mana cost.": {
    spell: { colorless: false, xInManaCost: false },
  },
};

const COLOR_LETTER = { white: "W", blue: "U", black: "B", red: "R", green: "G" };

/**
 * "~ becomes a 3/3 red and green Elemental creature with "Whenever …"": `animate`
 * with the whole ability granted beside it (`grant-triggered`, `grant-static`,
 * `grant-protection`), by the animation's duration — Raging Ravine, Restless
 * Spire, Veiled Serpent, Veiled Apparition, Opal Guardian. "It's still a land"
 * adds the type; with no such sentence the types are replaced (rule 205.1a).
 * `null` for anything else, a bare keyword animate among it.
 */
function becomesWithAbilitiesOf(text) {
  const still = /^(.+) It's still a land\.$/s.exec(text);
  const body = still === null ? text : still[1];
  const m = /^(Until end of turn, )?(?:~|It) becomes an? (\d+)\/(\d+) (.+?) creature with (.+?)$/s.exec(body);
  if (m === null) return null;
  const duration = m[1] !== undefined ? "end-of-turn" : "permanent";
  // The characteristics: colors, then capitalized creature types.
  const described = /^((?:(?:white|blue|black|red|green)(?:, and |, | and )?)+ )?([A-Z][a-z]+(?: [A-Z][a-z]+)*)$/.exec(m[4]);
  if (described === null) return null;
  const colors = (described[1] ?? "").split(/, and |, | and | /).filter(Boolean).map((c) => COLOR_LETTER[c]);
  const subtypes = described[2].split(" ");
  // The abilities: keywords and a protection, then at most one quoted ability.
  const quoted = /^(?:(.+) and )?"(.+)"$/s.exec(m[5]);
  const plain = quoted !== null ? (quoted[1] ?? "") : m[5].replace(/\.$/, "");
  const keywords = [];
  const grants = [];
  for (const word of plain.split(/, and |, | and /).filter(Boolean)) {
    const keyword = KEYWORDS[word.toLowerCase()];
    const protection = /^protection from (white|blue|black|red|green)$/.exec(word);
    if (keyword !== undefined) keywords.push(keyword);
    else if (protection !== null) grants.push({ kind: "grant-protection", target: "source", from: { colors: [COLOR_LETTER[protection[1]]] }, duration });
    else return null;
  }
  if (quoted !== null) {
    // Read as a face of its own, as "this creature" in the text it's given.
    const ability = quoted[2].replace(/^~/, "This creature").replace(/~/g, "this creature");
    const inner = parseFace({ name: "Quoted Ability", type_line: "Creature", oracle_text: ability });
    if (inner.complete !== true) return null;
    if (inner.triggered.length === 1 && inner.static.length === 0) {
      grants.push({ kind: "grant-triggered", target: "source", ability: inner.triggered[0], duration });
    } else if (inner.static.length === 1 && inner.triggered.length === 0) {
      grants.push({ kind: "grant-static", target: "source", ability: inner.static[0], duration });
    } else return null;
  }
  if (grants.length === 0) return null;
  return {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: "source",
        power: Number(m[2]),
        toughness: Number(m[3]),
        ...(still !== null
          ? { addTypes: ["creature"], addSubtypes: subtypes }
          : { setTypes: ["creature"], addTypes: [], addSubtypes: [], setSubtypes: subtypes }),
        ...(colors.length > 0 ? { setColors: colors } : {}),
        ...(keywords.length > 0 ? { keywords } : {}),
        duration,
      },
      ...grants,
    ],
  };
}

/** Each line a `choose-one-of-each` is the whole of, with its prompt. */
const ONE_OF_EACH_EFFECTS = {
  "Each player chooses from among the permanents they control an artifact, a creature, an enchantment, and a land, then sacrifices the rest.": {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: ["artifact", "creature", "enchantment", "land"],
    filter: {},
    rest: "sacrifice",
    prompt: "Choose an artifact, a creature, an enchantment, and a land to keep — the rest are sacrificed",
  },
  "Each player chooses from the lands they control a land of each basic land type, then sacrifices the rest.": {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: "basic-land-types",
    filter: { type: "land" },
    rest: "sacrifice",
    prompt: "Choose a land of each basic land type to keep — the other lands are sacrificed",
  },
  "Each player chooses a land they control of each basic land type. Return those lands to their owners' hands.": {
    kind: "choose-one-of-each",
    who: "each-player",
    slots: "basic-land-types",
    filter: { type: "land" },
    chosen: "return-to-hand",
    prompt: "Choose a land of each basic land type to return to its owner's hand",
  },
  "Choose a land of each basic land type, then destroy those lands.": {
    kind: "choose-one-of-each",
    who: "you",
    slots: "basic-land-types",
    filter: { type: "land" },
    anyController: true,
    chosen: "destroy",
    prompt: "Choose a land of each basic land type to destroy",
  },
  "Each player reveals their hand, chooses one card of each color from it, then discards all other nonland cards.": {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: "each-player" },
      {
        kind: "choose-one-of-each",
        who: "each-player",
        slots: "colors",
        filter: {},
        fromHand: true,
        rest: { discard: { notTypes: ["land"] } },
        prompt: "Choose one card of each color — your other nonland cards are discarded",
      },
    ],
  },
};

export function parseEffect(text, outer) {
  // Each target a sentence names takes the next slot of the ability's list.
  const ctx = { ...outer, target: (spec) => outer.targets.push(spec) - 1 };
  const sentences = sentencesOf(text);
  const parsed = [];
  const todo = [];
  const hints = [];
  let skip = 0;
  const becomes = becomesWithAbilitiesOf(text);
  if (becomes !== null) return { effect: becomes, todo: [], hints: [] };

  // A suspend cost as an alternative cost (The Face of Boe).
  if (text === "You may cast a spell with suspend from your hand. If you do, pay its suspend cost rather than its mana cost.") {
    return { effect: { kind: "cast-now", from: "hand", spell: { hasSuspend: true }, suspendCost: true }, todo: [], hints: [] };
  }
  // One for each of several categories (`choose-one-of-each`).
  const oneOfEach = ONE_OF_EACH_EFFECTS[text.charAt(0).toUpperCase() + text.slice(1)];
  if (oneOfEach !== undefined) return { effect: oneOfEach, todo: [], hints: [] };

  // A copy for each permanent the spell could target (rule 707.10d): Zada's,
  // Ink-Treader Nephilim's own, Mirrorwing Dragon's and Precursor Golem's made
  // by the caster, from whose side "they control" reads.
  const eachCopy =
    /^(That player copies|Copy) (?:that|the) spell for each other (creature you control|creature they control|creature|Golem) that (?:the )?spell could target\. Each copy targets a different one of those (?:creatures|Golems)\.$/.exec(
      text,
    );
  if (eachCopy !== null) {
    const byCaster = eachCopy[1] === "That player copies";
    const golem = eachCopy[2] === "Golem";
    const own = / (you|they) control$/.test(eachCopy[2]);
    return {
      effect: {
        kind: "copy-spell",
        target: "trigger-spell",
        ...(byCaster ? { controller: "trigger-controller" } : {}),
        forEachItCouldTarget: {
          filter: golem ? { subtype: "Golem" } : own ? { type: "creature", controlledBy: "you" } : { type: "creature" },
          other: golem ? "targeted" : true,
        },
      },
      todo: [],
      hints: [],
    };
  }
  // Desecrator Hag: untargeted, read as it resolves; a tie is the controller's
  // choice among the tied (`greatestInZone` in that graveyard).
  if (
    text ===
    "Return to your hand the creature card in your graveyard with the greatest power. If two or more cards are tied for greatest power, you choose one of them."
  ) {
    return {
      effect: { kind: "return-from-graveyard", filter: GREATEST_POWER_HERE, destination: "hand", count: 1 },
      todo: [],
      hints: [],
    };
  }
  // Shallow Grave's and Corpse Dance's whole text: the top creature card of
  // your graveyard (rule 404.2), and what follows reads it as target 0.
  if (
    text === "Return the top creature card of your graveyard to the battlefield. That creature gains haste until end of turn. Exile it at the beginning of the next end step."
  ) {
    return {
      effect: {
        kind: "top-of-graveyard",
        filter: { type: "creature" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: 0 },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            { kind: "delayed-trigger", at: "next-end-step", effect: { kind: "exile", target: 0 }, text: "Exile it." },
          ],
        },
      },
      todo: [],
      hints: [],
    };
  }
  // "Add … . Spend this mana only to …" naming a `ManaSpendPurpose` (rule
  // 106.6): the mana ability with its restriction, whole.
  const spendDeny = /^(Add .+?\.) (This mana can't be spent to cast spells from your hand\.)$/.exec(text);
  if (spendDeny !== null) {
    const slots = ctx.targets.length;
    const add = parseSentence(spendDeny[1], ctx);
    if (add?.kind === "add-mana") {
      return { effect: { ...add, spendOnly: { notCastFrom: ["hand"], text: spendDeny[2] } }, todo: [], hints: [] };
    }
    ctx.targets.length = slots;
  }
  const spendOnly = /^(Add .+?\.) (Spend this mana only .+\.)$/.exec(text);
  const spendClause = spendOnly === null ? undefined : MANA_SPEND_PURPOSE_LINES[spendOnly[2]];
  if (spendClause !== undefined) {
    const slots = ctx.targets.length;
    const add = parseSentence(spendOnly[1], ctx);
    if (add?.kind === "add-mana") {
      return { effect: { ...add, spendOnly: { ...spendClause, text: spendOnly[2] } }, todo: [], hints: [] };
    }
    ctx.targets.length = slots;
  }
  // "Add {R}. When you do, this creature deals 1 damage to each opponent"
  // (Rubble Rouser): the mana ability off the stack, a reflexive ability on it
  // (rule 603.12, its ruling), with no target for the mana ability to have.
  const addThenDo = /^(Add .+?\.) When you do, (.+\.)$/.exec(text);
  if (addThenDo !== null) {
    const slots = ctx.targets.length;
    const add = parseSentence(addThenDo[1], ctx);
    const reflexive = add?.kind === "add-mana" ? parseSentence(`${addThenDo[2][0].toUpperCase()}${addThenDo[2].slice(1)}`, ctx) : null;
    if (reflexive !== null && !containsUndefined(reflexive) && ctx.targets.length === slots) {
      const said = addThenDo[2].replaceAll("~", "this creature");
      return {
        effect: { ...add, also: { kind: "reflexive-trigger", targets: [], effect: reflexive, text: `When you do, ${said}` } },
        todo: [],
        hints: [],
      };
    }
    ctx.targets.length = slots;
  }
  // "Flip a coin. If you win the flip, … If you lose the flip, …" (rule 705, Goblin
  // Bangchuckers): one sentence each way. Nothing read, no target is kept.
  const flip = /^Flip a coin\. If you win the flip, (.+?\.) If you lose the flip, (.+?\.)$/.exec(text);
  if (flip !== null) {
    const slots = ctx.targets.length;
    const capital = (line) => `${line[0].toUpperCase()}${line.slice(1)}`;
    const won = parseSentence(capital(flip[1]), ctx);
    const lost = won === null ? null : parseSentence(capital(flip[2]), ctx);
    if (won !== null && lost !== null) return { effect: { kind: "flip-coin", won, lost }, todo: [], hints: [] };
    ctx.targets.length = slots;
  }
  // A spell cast from another player's hand as this resolves (rule 601.3 —
  // `cast-now`'s `handOf`): "look at that player's hand. You may cast a spell
  // from among those cards without paying its mana cost" (Silent-Blade Oni),
  // "you may look … If you do, you may cast …" (Mindleech Mass), and "target
  // opponent reveals their hand. You may cast an instant or sorcery spell from
  // among those cards …" (Mindclaw Shaman).
  const looksThenCasts = /^(You may look|Look) at that player's hand\. (?:If you do, you|You) may cast a spell from among those cards without paying its mana cost\.$/.exec(text);
  if (looksThenCasts !== null) {
    const castNow = { kind: "cast-now", from: { handOf: "trigger-player", look: true }, free: true };
    return {
      effect: looksThenCasts[1] === "Look" ? castNow : { kind: "may", prompt: "Look at that player's hand?", effect: castNow },
      todo: [],
      hints: [],
    };
  }
  const revealsThenCasts = /^Target opponent reveals their hand\. You may cast (?:an? (.+?) )?spell from among those cards without paying its mana cost\.$/.exec(text);
  if (revealsThenCasts !== null) {
    const spell = revealsThenCasts[1] === undefined ? {} : parseTypePhrase(revealsThenCasts[1]);
    if (spell !== null) {
      const slot = ctx.target("opponent");
      return {
        effect: {
          kind: "sequence",
          effects: [
            { kind: "reveal-hand", who: slot },
            { kind: "cast-now", from: { handOf: { target: slot } }, free: true, ...(revealsThenCasts[1] !== undefined ? { spell } : {}) },
          ],
        },
        todo: [],
        hints: [],
      };
    }
  }
  const looks = looksAtAnothersTop(text, ctx);
  if (looks !== null) return { effect: looks, todo: [], hints: [] };
  const chosen = paidAndBid(text, ctx) ?? chosenNumbers(text, ctx) ?? chosenAndTheRest(text) ?? lifeExchanges(text, ctx);
  if (chosen !== null) return { effect: chosen, todo: [], hints: [] };
  for (const [i, sentence] of sentences.entries()) {
    if (skip > 0) {
      skip -= 1;
      continue;
    }
    // "Exile the top card of your library. You may play that card until you
    // exile another card with ~." and the other windows, and "exile target
    // card from your graveyard" with a permission for a duration.
    const impulse = impulseWindowAt(sentences, i, ctx);
    if (impulse !== null) {
      parsed.push(impulse);
      hints.push({ sentence, effect: impulse });
      skip = 1;
      continue;
    }
    // "Exile target nonland permanent. For as long as that card remains exiled,
    // its owner may play it."
    const ownerPermission = ownerPermissionAt(sentences, i, ctx);
    if (ownerPermission !== null) {
      parsed.push(ownerPermission.effect);
      hints.push({ sentence, effect: ownerPermission.effect });
      skip = ownerPermission.used - 1;
      continue;
    }
    // "Create a … token. When you do, attach it to target creature you
    // control." and the others reading what the step before made, returned or
    // targeted (`reflexiveAboutAt`).
    const reflexive = reflexiveAboutAt(sentences, i, ctx);
    if (reflexive !== null) {
      for (const effect of reflexive) {
        parsed.push(effect);
        hints.push({ sentence, effect });
      }
      skip = 1;
      continue;
    }
    // "You may pay {1}{W} any number of times. When you pay this cost one or
    // more times, …" (`payTimesAt`).
    const payTimes = payTimesAt(sentences, i, ctx);
    if (payTimes !== null) {
      parsed.push(payTimes);
      hints.push({ sentence, effect: payTimes });
      skip = 1;
      continue;
    }
    // "You get {E}{E}{E}, then you may pay any amount of {E}." and what it
    // pays for (`energyAmountAt`).
    const energyPay = energyAmountAt(sentences, i, ctx);
    if (energyPay !== null) {
      for (const effect of energyPay.effects) {
        parsed.push(effect);
        hints.push({ sentence, effect });
      }
      skip = energyPay.used - 1;
      continue;
    }
    // "Target creature card in your graveyard gains embalm until end of turn.
    // The embalm cost is equal to its mana cost." (Cursecloth Wrappings), and
    // "each artifact creature card in your graveyard gains unearth {3} until
    // end of turn" (Ghost Ark): `grant-graveyard-keyword`.
    const gainsM = new RegExp(
      `^(target|each) ([a-z ]+?) card in your graveyard gains (${GRAVEYARD_KEYWORD})(?: ((?:\\{[^}]+\\})+))? until end of turn\\.$`,
      "i",
    ).exec(sentence);
    if (gainsM !== null) {
      const filter = parseTypePhrase(gainsM[2], { cards: true });
      const sameAs = new RegExp(`^(?:the|its) ${gainsM[3]} cost is equal to its mana cost\\.$`, "i").test(sentences[i + 1] ?? "");
      if (filter !== null && (gainsM[4] !== undefined || sameAs || gainsM[3] === "retrace")) {
        const grant = { keyword: gainsM[3], ...(gainsM[4] !== undefined ? { cost: gainsM[4] } : {}) };
        const effect =
          gainsM[1].toLowerCase() === "target"
            ? {
                kind: "grant-graveyard-keyword",
                target: ctx.target({ kind: "card-in-graveyard", whose: "you", filter }),
                grant,
              }
            : { kind: "grant-graveyard-keyword", filter, grant };
        parsed.push(effect);
        hints.push({ sentence, effect });
        if (sameAs) skip = 1;
        continue;
      }
    }
    // "Choose target creature you don't control. Each creature you control
    // that's a Wolf or a Werewolf deals damage equal to its power to that
    // creature." (Moonlight Hunt): the second sentence, read with the target
    // in place of "that creature" (`each-deals-damage`).
    const chooseM = /^choose (target [a-z' ]+)\.$/i.exec(sentence);
    const thatM = chooseM === null ? null : /^(each .+ deals .+ to )that (?:creature|permanent)\.$/i.exec(sentences[i + 1] ?? "");
    if (chooseM !== null && thatM !== null) {
      const effect = parseSentence(`${thatM[1]}${chooseM[1]}.`, ctx);
      if (effect !== null && effect.kind === "each-deals-damage" && !containsUndefined(effect)) {
        parsed.push(effect);
        hints.push({ sentence, effect });
        skip = 1;
        continue;
      }
    }
    // Parley (an ability word): "Each player reveals the top card of their
    // library. For each nonland card revealed this way, X. Then each player
    // draws a card." — a `reveal-top` with `who`, X scaled by the cards
    // revealed this way (the `parley` helper's shape).
    const parleyM = /^for each (nonland|land) card revealed this way, (?:you )?(.+)\.$/i.exec(sentences[i + 1] ?? "");
    if (/^each player reveals the top card of their library\.$/i.test(sentence) && parleyM !== null && /^then each player draws a card\.$/i.test(sentences[i + 2] ?? "")) {
      const amount = { thisWay: "revealed", filter: parleyM[1].toLowerCase() === "land" ? { type: "land" } : { notTypes: ["land"] } };
      const each = parseSentence(`${parleyM[2][0].toUpperCase()}${parleyM[2].slice(1)}.`, ctx);
      const scaled = each === null || containsUndefined(each) ? null : scaledBy(each, amount);
      if (scaled !== null) {
        const reveal = {
          kind: "reveal-top",
          who: "each-player",
          then: { kind: "sequence", effects: [scaled, { kind: "draw", amount: 1, who: "each-player" }] },
        };
        parsed.push(reveal);
        hints.push({ sentence, effect: reveal });
        skip = 2;
        continue;
      }
    }
    // "Look at the top five cards of your library. You may reveal a creature
    // card from among them and put it into your hand. Put the rest on the
    // bottom of your library in a random order." (Adventure Awaits, Basic
    // Conjuration) — one look-and-choose, only the card taken shown.
    const lookTopM = /^look at the top (\w+) cards of your library\.$/i.exec(sentence);
    const revealTakeM =
      lookTopM === null ? null : /^you may reveal an? (.+?) card from among them and put it into your hand\.$/i.exec(sentences[i + 1] ?? "");
    if (revealTakeM !== null && /^put the rest on the bottom of your library in a random order\.$/i.test(sentences[i + 2] ?? "")) {
      const count = numberOf(lookTopM[1]);
      const filter = parseTypePhrase(revealTakeM[1]);
      if (typeof count === "number" && filter !== null && Object.keys(filter).length > 0) {
        const look = {
          kind: "look-and-choose",
          zone: "library",
          count,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter,
          destination: "hand",
          leftover: "bottom-random",
        };
        parsed.push(look);
        hints.push({ sentence, effect: look });
        skip = 2;
        continue;
      }
    }
    // "Look at the top three cards of your library. Exile one of those cards
    // and put the rest on the bottom of your library in a random order. You
    // may play the exiled card this turn." (Florian's shape), "… You may
    // exile a nonland card from among them. Put the rest on the bottom … You
    // may cast the exiled card without paying its mana cost." (The Key to the
    // Vault): one look-and-choose exiling the pick, which may then be played
    // this turn (`playable`) or cast free as this resolves (`then`).
    if (lookTopM !== null) {
      const count = numberOf(lookTopM[1]);
      const one = /^exile one of (?:those cards|them) and put the rest on the bottom of your library in a random order\.$/i.test(sentences[i + 1] ?? "");
      const mayM = one ? null : /^you may exile (?:one of those cards|one of them|an? (.+?) card from among them)\.$/i.exec(sentences[i + 1] ?? "");
      const restAt = one ? i + 2 : i + 3;
      const rest = one || (mayM !== null && /^put the rest on the bottom of your library in a random order\.$/i.test(sentences[i + 2] ?? ""));
      const after = sentences[restAt] ?? "";
      const play = /^you may play the exiled card this turn\.$/i.test(after);
      const free = /^you may cast the exiled card without paying its mana cost\.$/i.test(after);
      const filter = mayM?.[1] === undefined ? {} : parseTypePhrase(mayM[1]);
      if (typeof count === "number" && rest && (play || free) && filter !== null) {
        const look = {
          kind: "look-and-choose",
          zone: "library",
          count,
          min: one ? 1 : 0,
          max: 1,
          ...(Object.keys(filter).length > 0 ? { filter } : {}),
          destination: "exile",
          unlinked: true,
          ...(play ? { playable: { duration: "end-of-turn" } } : {}),
          leftover: "bottom-random",
          ...(free ? { then: { kind: "cast-now", target: 0, free: true } } : {}),
        };
        parsed.push(look);
        hints.push({ sentence, effect: look });
        skip = restAt - i;
        continue;
      }
    }
    // "Exile the top ten cards of your library. Put all artifact cards from
    // among them onto the battlefield." (Tezzeret, Master of the Bridge), "…
    // You may put any number of creature and/or land cards from among them
    // onto the battlefield." (Xenagos, the Reveler): exiled first, then a
    // choice over the cards exiled this way — all of them that match, or any
    // number — the rest staying exiled.
    const exileTopM = /^exile the top (\w+) cards of your library\.$/i.exec(sentence);
    const putAmongM =
      exileTopM === null
        ? null
        : /^(put all|you may put any number of) (.+?) cards from among them onto the battlefield\.$/i.exec(sentences[i + 1] ?? "");
    if (putAmongM !== null) {
      const count = numberOf(exileTopM[1]);
      const filter = parseTypePhrase(putAmongM[2]);
      if (typeof count === "number" && filter !== null && Object.keys(filter).length > 0) {
        const all = putAmongM[1].toLowerCase() === "put all";
        const effects = [
          { kind: "exile-from-library", amount: count },
          {
            kind: "look-and-choose",
            zone: "exile",
            min: all ? count : 0,
            max: count,
            filter: { thisWay: "exiled", ...filter },
            destination: "battlefield",
            leftover: "stay",
          },
        ];
        for (const effect of effects) {
          parsed.push(effect);
          hints.push({ sentence, effect });
        }
        skip = 1;
        continue;
      }
    }
    // After "exile the top N cards of your library": "You may cast an Aura
    // spell from among them without paying its mana cost." (Herald of Amity)
    // — a free cast from the cards exiled this way, as this resolves — and
    // then "Then put the rest on the bottom of your library in a random
    // order.", the cards still exiled (Muse Vortex's instants and sorceries
    // not cast go to the hand first).
    if (parsed.at(-1)?.kind === "exile-from-library") {
      const castM = /^you may cast an? (.+?) spell (with mana value x or less )?from among them without paying its mana cost\.$/i.exec(sentence);
      const filter = castM === null ? null : parseTypePhrase(castM[1]);
      if (castM !== null && filter !== null && Object.keys(filter).length > 0) {
        const spell = castM[2] === undefined ? filter : { ...filter, manaValue: { op: "lte", n: { amount: "x" } } };
        const castNow = { kind: "cast-now", from: "exiled-this-way", free: true, spell };
        parsed.push(castNow);
        hints.push({ sentence, effect: castNow });
        continue;
      }
      // "You may cast up to two sorcery spells with mana value 3 or less from
      // among them without paying their mana costs" (Collected Conjuring);
      // "You may cast any number of spells with total mana value 10 or less
      // from among them …" (Primeval Spawn).
      const upToM = /^you may cast up to (\w+) (?:(\w+) )?spells(?: with mana value (\d+) or less)? from among (?:them|the exiled cards) without paying their mana costs\.$/i.exec(sentence);
      const totalM = /^you may cast any number of spells with total mana value (\d+) or less from among (?:them|the exiled cards) without paying their mana costs\.$/i.exec(sentence);
      const upTo = upToM === null ? null : numberOf(upToM[1]);
      const typed = upToM?.[2] === undefined ? {} : parseTypePhrase(upToM[2]);
      if ((upToM !== null && upTo !== null && typed !== null) || totalM !== null) {
        const spell = {
          ...(typed ?? {}),
          ...(upToM?.[3] !== undefined ? { manaValue: { op: "lte", n: Number(upToM[3]) } } : {}),
        };
        const castNow = {
          kind: "cast-now",
          from: "exiled-this-way",
          repeat: true,
          ...(upToM !== null ? { upTo } : { totalManaValue: Number(totalM[1]) }),
          free: true,
          ...(Object.keys(spell).length > 0 ? { spell } : {}),
        };
        parsed.push(castNow);
        hints.push({ sentence, effect: castNow });
        continue;
      }
    }
    if (parsed.at(-1)?.kind === "cast-now" && parsed.at(-1).from === "exiled-this-way" && parsed.at(-2)?.kind === "exile-from-library") {
      const moves = /^(?:then put the rest|put the exiled cards not cast this way) on the bottom of your library in a random order\.$/i.test(sentence)
        ? [{ kind: "move-exiled-this-way", to: "library-bottom" }]
        : /^then put the exiled instant and sorcery cards that weren't cast this way into your hand and the rest on the bottom of your library in a random order\.$/i.test(sentence)
          ? [
              { kind: "move-exiled-this-way", to: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
              { kind: "move-exiled-this-way", to: "library-bottom" },
            ]
          : [];
      if (moves.length > 0) {
        for (const effect of moves) {
          parsed.push(effect);
          hints.push({ sentence, effect });
        }
        continue;
      }
    }
    // "Choose a card at random that was exiled with ~. Put that card into its
    // owner's hand." (Skyship Weatherlight) — two sentences, one pick among
    // the cards linked to the source (rule 607.2a).
    if (
      /^choose a card at random (?:that was )?exiled with ~\.$/i.test(sentence) &&
      /^put that card into its owner's hand\.$/i.test(sentences[i + 1] ?? "")
    ) {
      const pick = {
        kind: "choose-random-card",
        zone: "exiled-with-source",
        then: { kind: "return-to-hand", target: 0, from: "exile" },
      };
      parsed.push(pick);
      hints.push({ sentence, effect: pick });
      skip = 1;
      continue;
    }
    // A wish that may take a face-up exiled card instead (rule 701.23j):
    // "You may reveal an artifact card you own from outside the game or
    // choose a face-up artifact card you own in exile. Put that card into
    // your hand." (Karn, the Great Creator) — two sentences, one search.
    const faceUp = /^you may reveal an? (.+?) card you own from outside the game or choose a face-up (.+?) card you own in exile\.$/i.exec(
      sentence,
    );
    if (faceUp !== null && faceUp[1] === faceUp[2] && /^put that card into your hand\.$/i.test(sentences[i + 1] ?? "")) {
      const filter = parseTypePhrase(faceUp[1], { cards: true });
      if (filter !== null) {
        const wish = {
          kind: "search-library",
          filter,
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
          outside: "only",
          faceUpExile: true,
        };
        parsed.push(wish);
        hints.push({ sentence, effect: wish });
        skip = 1;
        continue;
      }
    }
    // A search of another player's zones (`search-library`'s `whose`):
    // "[Choose a nonland card name.] Search target player's graveyard, hand,
    // and library for all cards with that name and exile them. Then that
    // player shuffles." — two or three sentences, one effect.
    // "Then that player reveals their hand and exiles all cards with that name
    // from their hand and graveyard." (Legion's End): two steps of one sentence.
    if (ctx.targets.length === 1 && /^then that player reveals their hand and exiles all cards with that name from their hand and graveyard\.$/i.test(sentence)) {
      const steps = [
        { kind: "reveal-hand", who: { controllerOfTarget: 0 } },
        { kind: "exile-graveyard", target: { controllerOfTarget: 0 }, filter: { sameNameAsTarget: 0 }, fromHand: "also" },
      ];
      parsed.push(...steps);
      hints.push({ sentence, effect: steps[1] });
      continue;
    }
    const searched = searchOthersAt(sentences, i, ctx) ?? searchInsteadAt(sentences, i) ?? searchZonesAt(sentences, i);
    if (searched !== null) {
      parsed.push(searched.effect);
      hints.push({ sentence, effect: searched.effect });
      skip = searched.used - 1;
      continue;
    }
    // A value chosen as it resolves: "Choose a color. …", one `choose-value`.
    const chosen = chosenValueAt(sentences, i, ctx);
    if (chosen !== null) {
      parsed.push(chosen.effect);
      hints.push({ sentence, effect: chosen.effect });
      skip = chosen.used - 1;
      continue;
    }
    // Rule 700.3's piles: two or three sentences, one `separate-into-piles`.
    const piles = pilesAt(sentences, i, ctx);
    if (piles !== null) {
      parsed.push(piles.effect);
      hints.push({ sentence, effect: piles.effect });
      skip = piles.used - 1;
      continue;
    }
    // Face down with what it is: "Turn target creature face down. It's a 2/2
    // Cyberman artifact creature." — two sentences, one effect.
    const faceDownAs = faceDownAsAt(sentences, i, ctx);
    if (faceDownAs !== null) {
      parsed.push(faceDownAs.effect);
      hints.push({ sentence, effect: faceDownAs.effect });
      skip = faceDownAs.used - 1;
      continue;
    }
    // Put onto the battlefield with what it is in addition to its own: "Put
    // target creature card … under your control. That creature is a black
    // Zombie in addition to its other colors and types." — one effect.
    const enteredAs = enterAsAt(sentences, i, ctx);
    if (enteredAs !== null) {
      parsed.push(enteredAs.effect);
      hints.push({ sentence, effect: enteredAs.effect });
      skip = enteredAs.used - 1;
      continue;
    }
    // "Copy …. You may choose new targets for the copy." (rule 707.10c)
    const copied = copyNewTargetsAt(sentences, i, ctx);
    if (copied !== null) {
      parsed.push(copied.effect);
      hints.push({ sentence, effect: copied.effect });
      skip = copied.used - 1;
      continue;
    }
    // A choice among the spell's own targets as it resolves (Incriminate,
    // Barrin's Spite): two or three sentences, one `choose-among-targets`.
    // A removal of counters and "that many" after it (`countersRemovedAt`).
    const removedThen = countersRemovedAt(sentences, i, ctx);
    if (removedThen !== null) {
      for (const effect of removedThen.effects) {
        parsed.push(effect);
        hints.push({ sentence, effect });
      }
      skip = removedThen.used - 1;
      continue;
    }
    // "Choose target creature card in a graveyard that was put there from the
    // battlefield this turn. Put that card onto the battlefield under your
    // control." (Grim Return) — two sentences, one effect on the target.
    const extraTurn = extraTurnScopeAt(sentences, i);
    if (extraTurn !== null) {
      parsed.push(extraTurn.effect);
      hints.push({ sentence, effect: extraTurn.effect });
      skip = extraTurn.used - 1;
      continue;
    }
    const handsAway = handsFaceDownAt(sentences, i, ctx);
    if (handsAway !== null) {
      for (const effect of handsAway.effects) {
        parsed.push(effect);
        hints.push({ sentence, effect });
      }
      skip = handsAway.used - 1;
      continue;
    }
    const blocks = blocksAtEndOfCombatAt(sentences, i, ctx);
    if (blocks !== null) {
      parsed.push(blocks.effect);
      hints.push({ sentence, effect: blocks.effect });
      skip = blocks.used - 1;
      continue;
    }
    const arrival = graveyardArrivalAt(sentences, i, ctx);
    if (arrival !== null) {
      parsed.push(arrival.effect);
      hints.push({ sentence, effect: arrival.effect });
      skip = arrival.used - 1;
      continue;
    }
    const among = amongTargetsAt(sentences, i, ctx) ?? chosenTargetsAt(sentences, i, ctx);
    if (among !== null) {
      parsed.push(among.effect);
      hints.push({ sentence, effect: among.effect });
      skip = among.used - 1;
      continue;
    }
    const fromHand = revealedHandChoiceAt(sentences, i, ctx);
    if (fromHand !== null) {
      parsed.push(fromHand.effect);
      hints.push({ sentence, effect: fromHand.effect });
      skip = fromHand.used - 1;
      continue;
    }
    // "Sacrifice ~. If you do, ~ deals 10 damage to that player." (Booby
    // Trap): the damage hangs on the sacrifice (`sacrifice-source`'s `then`),
    // dealt by the permanent as it last existed.
    const sacDamage = new RegExp(`^If you do, ~ deals ${N} damage to that player\\.$`).exec(sentence);
    if (sacDamage !== null && ctx.thatPlayer !== undefined && parsed.at(-1)?.kind === "sacrifice-source" && parsed.at(-1).then === undefined) {
      const n = numberOf(sacDamage[1]);
      if (typeof n === "number") {
        const sac = { kind: "sacrifice-source", then: { kind: "damage", amount: n, who: ctx.thatPlayer } };
        parsed[parsed.length - 1] = sac;
        hints.push({ sentence, effect: sac });
        continue;
      }
    }
    // "Sacrifice ~. If you do, each of that player's opponents draws three
    // cards." (Standstill).
    const sacDraw = new RegExp(`^If you do, each of that player's opponents draws ${N} cards?\\.$`).exec(sentence);
    if (sacDraw !== null && ctx.thatPlayer === "trigger-controller" && parsed.at(-1)?.kind === "sacrifice-source" && parsed.at(-1).then === undefined) {
      const n = numberOf(sacDraw[1]);
      if (typeof n === "number") {
        const sac = { kind: "sacrifice-source", then: { kind: "draw", amount: n, who: "opponents-of-trigger-controller" } };
        parsed[parsed.length - 1] = sac;
        hints.push({ sentence, effect: sac });
        continue;
      }
    }
    const whoCant = whoCantAt(sentences, i);
    if (whoCant !== null) {
      parsed.push(whoCant.effect);
      hints.push({ sentence, effect: whoCant.effect });
      skip = whoCant.used - 1;
      continue;
    }
    const nameChoice = nameChoiceAt(sentences, i, ctx);
    if (nameChoice !== null) {
      parsed.push(nameChoice.effect);
      hints.push({ sentence, effect: nameChoice.effect });
      skip = nameChoice.used - 1;
      continue;
    }
    const oneEach =
      oneEachLookAt(sentences, i) ??
      splitLookAt(sentences, i) ??
      totalManaValueLookAt(sentences, i) ??
      revealUntilAt(sentences, i, ctx) ??
      opponentDividesFindsAt(sentences, i, ctx) ??
      distinctSetAt(sentences, i) ??
      counterAbilityAt(sentences, i, ctx) ??
      opponentChoosesInGraveyardAt(sentences, i, ctx);
    if (oneEach !== null) {
      parsed.push(oneEach.effect);
      hints.push({ sentence, effect: oneEach.effect });
      skip = oneEach.used - 1;
      continue;
    }
    // A card of those exiled with ~ chosen as this resolves (Muse Vessel, Bag
    // of Devouring), and paying for what follows (Purgatory).
    const forced = forcedAttackAt(sentences, i, ctx);
    if (forced !== null) {
      parsed.push(forced.effect);
      hints.push({ sentence, effect: forced.effect });
      skip = forced.used - 1;
      continue;
    }
    const exiledPick = exiledCardPickAt(sentences, i, ctx);
    if (exiledPick !== null) {
      parsed.push(exiledPick.effect);
      hints.push({ sentence, effect: exiledPick.effect });
      skip = exiledPick.used - 1;
      continue;
    }
    // A hand shown, then a count of it (Search Warrant), a card at random
    // from it and what follows on that card (Planeswalker's Fury), up to N
    // cards chosen from your own (Vault 21: House Gambit, Armored Kincaller).
    const handReveal = handRevealAt(sentences, i, ctx);
    if (handReveal !== null) {
      parsed.push(handReveal.effect);
      hints.push({ sentence, effect: handReveal.effect });
      skip = handReveal.used - 1;
      continue;
    }
    // The Urza's Destiny Scents: "Reveal any number of green cards in your
    // hand." — a `look-and-choose` over the hand that moves nothing — and
    // the next sentence's "… for each card revealed this way" scaled by
    // `{ thisWay: "revealed" }` when it's a life gain, a "pays {1}" or one
    // `scaledBy` knows.
    const revealM = /^reveal any number of (white|blue|black|red|green) cards in your hand\.$/i.exec(sentence);
    if (revealM !== null) {
      const color = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[revealM[1].toLowerCase()];
      const reveal = {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        filter: { colors: [color] },
        destination: "reveal",
        leftover: "stay",
      };
      parsed.push(reveal);
      hints.push({ sentence, effect: reveal });
      const eachM = /^(.+) for each card revealed this way\.$/i.exec(sentences[i + 1] ?? "");
      const each = eachM === null ? null : parseSentence(`${eachM[1]}.`, ctx);
      if (each !== null && !containsUndefined(each)) {
        const amount = { thisWay: "revealed", who: "you" };
        const scaled =
          each.kind === "gain-life" && typeof each.amount === "number"
            ? { ...each, amount: each.amount === 1 ? amount : { product: [each.amount, amount] } }
            : each.kind === "unless" && each.options.length === 1 && each.options[0].pay === "{1}"
              ? { ...each, options: [{ payGeneric: amount, text: "Pay {1} for each card revealed" }] }
              : scaledBy(each, amount);
        if (scaled !== null) {
          parsed.push(scaled);
          hints.push({ sentence: sentences[i + 1], effect: scaled });
          skip = 1;
        }
      }
      continue;
    }
    // A processor (Battle for Zendikar): "You may put a card an opponent owns
    // from exile into that player's graveyard. If you do, …" — a
    // `look-and-choose` over the exile zone, and the next sentence on the
    // card chosen (`this-way: "chosen"`, which a Rest in Peace exiling it
    // again doesn't undo — the ruling); "two cards your opponents own … into
    // their owners' graveyards" is all or nothing (`needsMin`).
    const processM =
      /^you may put (a card an opponent owns|two cards your opponents own) from exile into (?:that player's graveyard|their owners' graveyards)\.$/i.exec(sentence);
    if (processM !== null) {
      const two = processM[1].toLowerCase().startsWith("two");
      const doneM = /^if you do, (.+)$/i.exec(sentences[i + 1] ?? "");
      const then = doneM === null ? null : parseSentence(`${doneM[1][0].toUpperCase()}${doneM[1].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const may = {
          kind: "may",
          prompt: two
            ? "Put two cards your opponents own from exile into their graveyards?"
            : "Put a card an opponent owns from exile into their graveyard?",
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "look-and-choose",
                zone: "exile",
                filter: { ownedBy: "opponent" },
                min: two ? 2 : 1,
                max: two ? 2 : 1,
                ...(two ? { needsMin: true } : {}),
                destination: "graveyard",
                leftover: "stay",
              },
              { kind: "conditional", condition: { kind: "this-way", what: "chosen", ...(two ? { atLeast: 2 } : {}) }, then },
            ],
          },
        };
        parsed.push(may);
        hints.push({ sentence, effect: may });
        skip = 1;
        continue;
      }
    }
    // "If you didn't put a card into your hand this way, draw a card"
    // (Adventure Awaits), "If you don't put a card into your hand this way,
    // create a Food token" (Courier of Comestibles): after whatever could
    // have put one there, the `"put-into-hand"` this-way kind with none.
    // "If an opponent has more life than you, you gain 4 life" (Sunset Revelry),
    // "You gain 2 life. Then if you have more life than an opponent, draw a
    // card" (Survival Cache), "Create a Treasure token if an opponent controls
    // more lands than you" (Beza): read as the instruction comes up (rule 608.2c).
    const comparedM =
      /^(?:then )?if ([^,]+), (.+)$/i.exec(sentence) ?? /^(.+) if ((?:an opponent|you) [^,]+ than (?:you|an opponent))\.$/i.exec(sentence);
    if (comparedM !== null) {
      const leading = /^(?:then )?if /i.test(sentence);
      const compared = playerComparisonOf(leading ? comparedM[1] : comparedM[2], ctx);
      const said = leading ? comparedM[2] : `${comparedM[1]}.`;
      const then = compared === undefined ? null : parseSentence(`${said[0].toUpperCase()}${said.slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const effect = { kind: "conditional", condition: compared, then };
        parsed.push(effect);
        hints.push({ sentence, effect });
        continue;
      }
    }
    const noneToHandM = /^if you (?:didn't|don't) put a card into your hand this way, (.+)$/i.exec(sentence);
    if (noneToHandM !== null && parsed.length > 0) {
      const then = parseSentence(`${noneToHandM[1][0].toUpperCase()}${noneToHandM[1].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const none = {
          kind: "conditional",
          condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
          then,
        };
        parsed.push(none);
        hints.push({ sentence, effect: none });
        continue;
      }
    }
    // "If you do" after "you may discard a card": the draw happens only if a
    // card was discarded (the pool's this-way conditional).
    if (/^if you do, draw (a|one|two|three) cards?\.$/i.test(sentence) && parsed.at(-1)?.kind === "may" && parsed.at(-1).effect.kind === "discard" && parsed.at(-1).effect.target === "you") {
      const draw = parseSentence(`${sentence.slice("If you do, ".length, "If you do, ".length + 1).toUpperCase()}${sentence.slice("If you do, ".length + 1)}`, ctx);
      if (draw !== null && !containsUndefined(draw)) {
        const may = parsed.pop();
        hints.pop();
        const howMany = /^if you do, draw (a|one|two|three) cards?\.$/i.exec(sentence)[1].toLowerCase();
        const combined = {
          kind: "may",
          prompt: howMany === "a" || howMany === "one" ? "Discard a card to draw a card?" : `Discard a card to draw ${howMany} cards?`,
          effect: {
            kind: "sequence",
            effects: [may.effect, { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: draw }],
          },
        };
        parsed.push(combined);
        hints.push({ sentence, effect: combined });
        continue;
      }
    }
    // "If you do" after "you may blight N" or "you may behold a Dragon": what
    // follows happens only if the player did — and the may is offered only
    // when they can (rules 701.68b, 701.4a) — so it's the may's `then`. Not
    // one that names "the blighted creature" (701.68c: that's the blight's
    // own `then`, a person's), nor "that land" or the like, which reaches
    // back past the may.
    // "If you've discarded a card this turn, draw a card." (Recalibrate): a
    // turn-tally condition asked as the effect resolves.
    const tallyIf = /^(if [^,]+,) (.+)$/i.exec(sentence);
    const tallyCondition = tallyIf === null ? undefined : TURN_TALLY_IFS[tallyIf[1].toLowerCase()];
    if (tallyCondition !== undefined) {
      const then = parseSentence(`${tallyIf[2][0].toUpperCase()}${tallyIf[2].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const conditional = { kind: "conditional", condition: tallyCondition, then };
        parsed.push(conditional);
        hints.push({ sentence, effect: conditional });
        continue;
      }
    }
    // "If the discarded card was a creature card, amass Orcs 1." (Moria
    // Scavenger), "… wasn't a land card, …" (Grab the Prize): the one card
    // a "discard a card" cost discarded (the `discarded` condition) — only
    // where the cost discards it, never a discard the effect makes.
    const discardedIf = ctx.costDiscarded === true ? /^if the discarded card (was|wasn't) (?:an? )?(.+?)(?: card)?, (.+)$/i.exec(sentence) : null;
    if (discardedIf !== null) {
      const negated = discardedIf[1].toLowerCase() === "wasn't";
      const filter = negated
        ? /^[a-z]+$/.test(discardedIf[2]) ? discardFilterOf(`non${discardedIf[2]}`) : null
        : discardFilterOf(discardedIf[2]);
      const then = filter === null ? null : parseSentence(`${discardedIf[3][0].toUpperCase()}${discardedIf[3].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const conditional = { kind: "conditional", condition: { kind: "discarded", filter }, then };
        parsed.push(conditional);
        hints.push({ sentence, effect: conditional });
        continue;
      }
    }
    const ifDid = /^if you do, (.+)$/i.exec(sentence);
    // "Sacrifice it. If you do, it deals 4 damage to each creature blocking
    // it" (Ib Halfheart): the object may be gone or no longer yours by then.
    if (ifDid !== null && parsed.at(-1)?.kind === "sacrifice-target" && parsed.at(-1).target === "trigger-object") {
      const then = parseSentence(`${ifDid[1][0].toUpperCase()}${ifDid[1].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const conditional = { kind: "conditional", condition: { kind: "this-way", what: "sacrificed" }, then };
        parsed.push(conditional);
        hints.push({ sentence, effect: conditional });
        continue;
      }
    }
    const mayKind = parsed.at(-1)?.kind === "may" ? parsed.at(-1).effect.kind : undefined;
    if (ifDid !== null && (mayKind === "blight" || mayKind === "behold") && parsed.at(-1).then === undefined && !/\b(blighted|beheld|that)\b/i.test(sentence)) {
      const then = parseSentence(`${ifDid[1][0].toUpperCase()}${ifDid[1].slice(1)}`, ctx);
      if (then !== null && !containsUndefined(then)) {
        const may = { ...parsed.pop(), then };
        hints.pop();
        parsed.push(may);
        hints.push({ sentence, effect: may });
        continue;
      }
    }
    // "If you do, ~ assigns no combat damage this turn." after a may (rule
    // 510.1a — Farrel's Zealot, Ophidian): the price of saying yes, so the
    // may's `then`.
    if (/^if you do, ~ assigns no combat damage this turn\.$/i.test(sentence) && parsed.at(-1)?.kind === "may" && parsed.at(-1).then === undefined) {
      const may = { ...parsed.pop(), then: { kind: "assigns-no-combat-damage", target: "source" } };
      hints.pop();
      parsed.push(may);
      hints.push({ sentence, effect: may });
      continue;
    }
    // "It can't be regenerated." (rule 701.19c) after the destroy it's about.
    // "A creature destroyed this way can't be regenerated" after a destroy
    // behind a condition (Tsabo's Assassin).
    if (
      /^a creature destroyed this way can't be regenerated\.$/i.test(sentence) &&
      parsed.at(-1)?.kind === "conditional" &&
      parsed.at(-1).then?.kind === "destroy"
    ) {
      const asked = parsed.at(-1);
      parsed[parsed.length - 1] = { ...asked, then: { ...asked.then, cantBeRegenerated: true } };
      continue;
    }
    if (/^it can't be regenerated\.$/i.test(sentence) && parsed.at(-1)?.kind === "destroy") {
      parsed[parsed.length - 1] = { ...parsed.at(-1), cantBeRegenerated: true };
      continue;
    }
    // "They can't be regenerated." after a sweep (Catastrophe, Endemic Plague).
    if (/^(?:they|those creatures) can't be regenerated\.$/i.test(sentence) && parsed.at(-1)?.kind === "destroy-all") {
      parsed[parsed.length - 1] = { ...parsed.at(-1), cantBeRegenerated: true };
      continue;
    }
    // "Its controller loses N life." after the one sentence that targeted:
    // that target's controller, as it last existed (Countersquall).
    // "It phases out." after the one sentence that targeted: that target
    // (Slip Out the Back — rule 702.26b).
    if (/^it phases out\.$/i.test(sentence) && i > 0 && ctx.targets.length === 1 && parsed.length > 0) {
      const out = { kind: "phase-out", target: 0 };
      parsed.push(out);
      hints.push({ sentence, effect: out });
      continue;
    }
    // "Prevent all combat damage that would be dealt to and dealt by that
    // creature this turn." after the one sentence that targeted (Ebony
    // Horse, Foxfire — rule 615): that target, both ways.
    const toAndByM = /^prevent all (combat )?damage that would be dealt to and dealt by (?:it|that creature|the creature) this turn\.$/i.exec(sentence);
    if (toAndByM !== null && i > 0 && ctx.targets.length === 1 && parsed.length > 0) {
      const combat = toAndByM[1] ? { combat: true } : {};
      const both = {
        kind: "sequence",
        effects: [
          { kind: "damage-rule", to: { target: 0 }, ...combat },
          { kind: "damage-rule", by: { target: 0 }, ...combat },
        ],
      };
      parsed.push(...both.effects);
      hints.push({ sentence, effect: both });
      continue;
    }
    // What the step before did, read by this one. "Untap them" / "Untap those
    // creatures" after a gain-control-all: what the effect applied to, already
    // yours or not (Mob Rule's ruling), whatever its power has become.
    const priorStep = parsed.at(-1);
    const untapTaken = /^untap (?:them|those creatures)\.$/i.exec(sentence);
    if (untapTaken !== null && priorStep?.kind === "gain-control-all") {
      const untap = { kind: "untap-all", filter: { thisWay: "control-effect" } };
      parsed.push(untap);
      hints.push({ sentence, effect: untap });
      continue;
    }
    // "They gain haste until end of turn." after that untap (the same
    // permanents), or a return to the battlefield (Wake the Past).
    if (/^they gain haste until end of turn\.$/i.test(sentence)) {
      const those =
        priorStep?.kind === "untap-all" && priorStep.filter?.thisWay !== undefined
          ? priorStep.filter.thisWay
          : priorStep?.kind === "return-from-graveyard" && priorStep.destination === "battlefield"
            ? "put-onto-battlefield"
            : null;
      if (those !== null) {
        const haste = { kind: "grant-keyword-all", filter: { thisWay: those }, keyword: "haste", duration: "end-of-turn" };
        parsed.push(haste);
        hints.push({ sentence, effect: haste });
        continue;
      }
    }
    // "~ deals damage to you equal to the number of cards revealed this way."
    // after a reveal-until (Madcap Experiment, Audacious Reshapers).
    if (/^~ deals damage to you equal to the number of cards revealed this way\.$/i.test(sentence) && priorStep?.kind === "reveal-until") {
      const burn = { kind: "damage", amount: { thisWay: "revealed" }, who: "you" };
      parsed.push(burn);
      hints.push({ sentence, effect: burn });
      continue;
    }
    // "Target player mills that many cards." after a shuffle into the library
    // (Psychic Spiral).
    if (/^target player mills that many cards\.$/i.test(sentence) && priorStep?.kind === "shuffle-graveyard-into-library") {
      const mill = { kind: "mill", target: ctx.target("player"), amount: { thisWay: "shuffled-into-library" } };
      parsed.push(mill);
      hints.push({ sentence, effect: mill });
      continue;
    }
    // "Then for each card you put on top of your library, you draw a card and
    // you lose 3 life." after a surveil (Starving Revenant).
    const keptM = /^then for each card you put on top of your library, you draw a card and you lose (\d+) life\.$/i.exec(sentence);
    if (keptM !== null && (priorStep?.kind === "surveil" || priorStep?.kind === "scry") && priorStep.then === undefined) {
      parsed[parsed.length - 1] = {
        ...priorStep,
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { keptOnTopThisWay: true } },
            { kind: "lose-life", amount: { product: [{ keptOnTopThisWay: true }, Number(keptM[1])] } },
          ],
        },
      };
      continue;
    }
    // "For each 1 damage prevented this way, put a +1/+1 counter on that
    // creature." right after each hit (rule 615.5 — Brace for Impact): the
    // shield on target 0 gets a `then`.
    const shieldBefore = parsed.at(-1);
    const onTargetZero = shieldBefore?.kind === "prevent-damage" ? shieldBefore.target === 0 : shieldBefore?.kind === "damage-rule" && shieldBefore.to?.target === 0;
    const perPrevented = /^for each 1 damage prevented this way, put a (\+\d+\/\+\d+) counter on (?:that creature|it)\.$/i.exec(sentence);
    if (perPrevented !== null && onTargetZero) {
      const { kind: _kind, target: _target, ...rest } = shieldBefore;
      parsed[parsed.length - 1] = {
        ...(rest.amount === "all" ? (({ amount: _all, ...more }) => more)(rest) : rest),
        kind: "damage-rule",
        to: { target: 0 },
        then: { kind: "add-counter", target: 0, counter: perPrevented[1], amount: "x" },
      };
      continue;
    }
    // … and read later, by a delayed ability the same resolution sets up
    // (Sacred Boon; Scars of the Veteran's "if it's a creature", asked now).
    const laterPrevented =
      /^at the beginning of the next end step, put a (\+\d+\/\+\d+) counter on that creature for each 1 damage prevented this way\.$/i.exec(sentence) ??
      /^if it's a creature, put a (\+\d+\/\+\d+) counter on it for each 1 damage prevented this way at the beginning of the next end step\.$/i.exec(sentence);
    if (laterPrevented !== null && onTargetZero) {
      const conditionally = /^if it's a creature/i.test(sentence);
      const delayed = {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: `Put a ${laterPrevented[1]} counter on ${conditionally ? "it" : "that creature"} for each 1 damage prevented this way.`,
        effect: { kind: "add-counter", target: 0, counter: laterPrevented[1], amount: { damagePreventedThisWay: true } },
      };
      const later = conditionally
        ? { kind: "conditional", condition: { kind: "target", index: 0, filter: { type: "creature" } }, then: delayed }
        : delayed;
      parsed.push(later);
      hints.push({ sentence, effect: later });
      continue;
    }
    // "Exile cards from the top of your library equal to the damage prevented
    // this way." after a source of your choice (Bone Mask).
    if (/^exile cards from the top of your library equal to the damage prevented this way\.$/i.test(sentence) && shieldBefore?.kind === "prevent-damage-from-chosen-source") {
      parsed[parsed.length - 1] = { ...shieldBefore, then: { kind: "exile-from-library", amount: "x" } };
      continue;
    }
    // "You gain life equal to the damage prevented this way." after a damage
    // rule (Awe Strike).
    if (/^you gain life equal to the damage prevented this way\.$/i.test(sentence) && parsed.at(-1)?.kind === "damage-rule") {
      parsed[parsed.length - 1] = { ...parsed.at(-1), gainLifePrevented: true };
      continue;
    }
    // … after a source of your choice (Reverse Damage), and only from a
    // source of a colour (Shadowbane, Samite Ministration).
    if (parsed.at(-1)?.kind === "prevent-damage-from-chosen-source") {
      if (/^you gain life equal to the damage prevented this way\.$/i.test(sentence)) {
        parsed[parsed.length - 1] = { ...parsed.at(-1), gainLifePrevented: true };
        continue;
      }
      const fromM = /^(?:if|whenever) damage from an? (white|blue|black|red|green)(?: or (white|blue|black|red|green))? source is prevented this way(?: this turn)?, you gain that much life\.$/i.exec(sentence);
      if (fromM !== null) {
        const colorOf = (word) => ({ colors: [COLOR_WORDS[word.toLowerCase()]] });
        parsed[parsed.length - 1] = {
          ...parsed.at(-1),
          gainLifePrevented: true,
          gainLifeFrom: fromM[2] === undefined ? colorOf(fromM[1]) : { anyOf: [colorOf(fromM[1]), colorOf(fromM[2])] },
        };
        continue;
      }
    }
    // "If that creature would die this turn, exile it instead." after the one
    // sentence that targeted (Lava Coil — rule 614.1a): that target — still
    // the first one past "… target Equipment attached to that creature"
    // (Fiery Annihilation's `attachedToThan` slots).
    const onlyAttachedAfter = ctx.targets
      .slice(1)
      .every((spec) => spec?.kind === "optional" && spec.of?.kind === "other" && spec.of.attachedToThan === true);
    if (/^if that (?:creature|planeswalker|creature or planeswalker) would die this turn, exile it instead\.$/i.test(sentence) && i > 0 && ctx.targets.length >= 1 && onlyAttachedAfter && parsed.length > 0) {
      const instead = { kind: "exile-if-dies-this-turn", target: 0 };
      parsed.push(instead);
      hints.push({ sentence, effect: instead });
      continue;
    }
    // "If a creature dealt damage this way would die this turn, exile it
    // instead." after the damage (Anger of the Gods): whatever it damaged.
    const damagedM = /^if a (creature|permanent) dealt damage (?:this way|by ~) would die this turn, exile it instead\.$/i.exec(sentence);
    if (damagedM !== null && parsed.some(dealsDamage)) {
      const instead = { kind: "exile-if-dies-this-turn", dealtDamageThisWay: damagedM[1].toLowerCase() };
      parsed.push(instead);
      hints.push({ sentence, effect: instead });
      continue;
    }
    // "It can't be regenerated this turn." after the one sentence that
    // targeted (Engulfing Flames, Rage of Purphoros — rule 701.19c).
    if (/^(?:it|that creature) can't be regenerated this turn\.$/i.test(sentence) && i > 0 && ctx.targets.length === 1 && parsed.length > 0) {
      const cant = { kind: "prohibit", target: 0, regeneration: true };
      parsed.push(cant);
      hints.push({ sentence, effect: cant });
      continue;
    }
    // "A creature dealt damage this way can't be regenerated this turn." after
    // the damage (Incinerate, Flamebreak): whatever creature it damaged.
    if (/^(?:a creature|creatures) dealt damage this way can't be regenerated this turn\.$/i.test(sentence) && parsed.some(dealsDamage)) {
      const cant = { kind: "prohibit", regeneration: true, dealtDamageThisWay: "creature" };
      parsed.push(cant);
      hints.push({ sentence, effect: cant });
      continue;
    }
    // "If it's a creature, it can't be regenerated this turn, and if it would
    // die this turn, exile it instead." after the one sentence that targeted
    // (Disintegrate, Carbonize): read as it resolves, damage dealt or not.
    if (/^if it's a creature, it can't be regenerated this turn, and if it would die this turn, exile it instead\.$/i.test(sentence) && i > 0 && ctx.targets.length === 1 && parsed.length > 0) {
      const cant = {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "sequence", effects: [{ kind: "prohibit", target: 0, regeneration: true }, { kind: "exile-if-dies-this-turn", target: 0 }] },
      };
      parsed.push(cant);
      hints.push({ sentence, effect: cant });
      continue;
    }
    // "~ deals 2 damage to that creature's controller" after the one sentence
    // that targeted (Consign to the Pit, Draconic Roar).
    const controllerDamageM = /^~ deals (\w+) damage to that (?:creature|permanent)'s controller\.$/.exec(sentence);
    if (controllerDamageM !== null && ctx.targets.length === 1 && parsed.length > 0 && typeof numberOf(controllerDamageM[1]) === "number") {
      const damage = { kind: "damage", amount: numberOf(controllerDamageM[1]), toControllerOfTarget: 0 };
      parsed.push(damage);
      hints.push({ sentence, effect: damage });
      continue;
    }
    // "Its owner gains 4 life" (Path of Peace), and "then that player discards
    // a card" / "mills X cards" after what moved the one target: its owner,
    // whose hand or graveyard that was (Recoil, Geth).
    const ownerLifeM = /^its owner (gains|loses) (\w+) life\.$/i.exec(sentence);
    if (ownerLifeM !== null && ctx.targets.length === 1 && parsed.length > 0 && typeof numberOf(ownerLifeM[2]) === "number") {
      const life = {
        kind: ownerLifeM[1].toLowerCase() === "gains" ? "gain-life" : "lose-life",
        amount: numberOf(ownerLifeM[2]),
        who: { ownerOfTarget: 0 },
      };
      parsed.push(life);
      hints.push({ sentence, effect: life });
      continue;
    }
    const ownerThenM = /^then that player (discards|mills) (a|an|one|two|three|x) cards?\.$/i.exec(sentence);
    if (ownerThenM !== null && ctx.targets.length === 1) {
      const last = parsed.at(-1);
      const discards = ownerThenM[1].toLowerCase() === "discards";
      const follows = discards
        ? last?.kind === "return-to-hand" && last.target === 0 && last.from === undefined
        : last?.kind === "put-onto-battlefield" && last.target === 0 && ctx.targets[0]?.kind === "card-in-graveyard";
      const n = ownerThenM[2].toLowerCase() === "x" ? "x" : numberOf(ownerThenM[2]);
      if (follows && (n === "x" || typeof n === "number")) {
        const effect = discards
          ? { kind: "discard", target: { ownerOfTarget: 0 }, amount: n }
          : { kind: "mill", target: { ownerOfTarget: 0 }, amount: n };
        parsed.push(effect);
        hints.push({ sentence, effect });
        continue;
      }
    }
    const lossM = /^its controller loses (\w+) life\.$/i.exec(sentence);
    if (lossM !== null && ctx.targets.length === 1 && parsed.length > 0 && typeof numberOf(lossM[1]) === "number") {
      const loss = { kind: "lose-life", amount: numberOf(lossM[1]), toControllerOfTarget: 0 };
      parsed.push(loss);
      hints.push({ sentence, effect: loss });
      continue;
    }
    // "Its controller draws / discards a card", "… gets a poison counter"
    // after the one sentence that targeted (Call to Heel, Assassin's Strike,
    // Pistus Strike): that target's controller, as it last existed.
    const itsM = /^its controller (draws|discards) (a|an|one|two|three) cards?\.$|^its controller gets (a|an|one|two|three) poison counters?\.$/i.exec(sentence);
    if (itsM !== null && ctx.targets.length === 1 && parsed.length > 0) {
      const who = { controllerOfTarget: 0 };
      const n = numberOf(itsM[2] ?? itsM[3]);
      if (typeof n === "number") {
        const effect =
          itsM[1]?.toLowerCase() === "draws"
            ? { kind: "draw", who, amount: n }
            : itsM[1]?.toLowerCase() === "discards"
              ? { kind: "discard", target: who, amount: n }
              : { kind: "add-player-counters", counter: "poison", who, amount: n };
        parsed.push(effect);
        hints.push({ sentence, effect });
        continue;
      }
    }
    // "Target artifact creature's controller sacrifices it. That player may
    // search their library for a noncreature artifact card, put it onto the
    // battlefield, then shuffle" (Arcum Dagsson): its controller's to decline.
    const sacrificesM = /^target (.+?)'s controller sacrifices it\.$/i.exec(sentence);
    if (sacrificesM !== null && ctx.targets.length === 0) {
      const types = parseTypePhrase(sacrificesM[1]);
      const spec = targetOf(sacrificesM[1]) ?? (types === null ? null : { kind: "permanent", filter: types });
      if (spec !== undefined && spec !== null) {
        ctx.targets.push(spec);
        const effect = { kind: "sacrifice-target", target: 0, byItsController: true };
        parsed.push(effect);
        hints.push({ sentence, effect });
        continue;
      }
    }
    const mayFor = controllerMaySearch(sentence, ctx, parsed);
    if (mayFor !== null) {
      parsed.push(mayFor);
      hints.push({ sentence, effect: mayFor });
      continue;
    }
    const anyOpponent = anyOpponentMayAt(sentences, i, parsed);
    if (anyOpponent !== null) {
      parsed.push(anyOpponent.effect);
      hints.push({ sentence, effect: anyOpponent.effect });
      skip = anyOpponent.used - 1;
      continue;
    }
    const before = ctx.targets.length;
    // The rhystic cards (Prophecy): "[effect] unless any player pays {2}." /
    // "Unless any player pays {2}, [effect]." — the effect behind an
    // `unless` every player is asked in turn, from the active player.
    const after = /^(.+) unless any player pays (\{(?:\d+|X)\})\.$/.exec(sentence);
    const ahead = /^Unless any player pays (\{(?:\d+|X)\}), (.+)\.$/.exec(sentence);
    const rhystic =
      after !== null
        ? [sentence, after[1], after[2]]
        : ahead !== null
          ? [sentence, `${ahead[2][0].toUpperCase()}${ahead[2].slice(1)}`, ahead[1]]
          : null;
    // "It" names the ability's object only in its first sentence: after
    // another ("Create a 0/0 token. Put a +1/+1 counter on it.") it's
    // whatever that sentence was about. "That creature" of a damage trigger
    // stays what the damage hit (Neko-Te's "tap that creature. That creature
    // doesn't untap …").
    const sentenceCtx = i === 0 || ctx.it === "trigger-recipient" ? ctx : { ...ctx, it: undefined, departed: undefined };
    const inner = rhystic === null ? null : parseSentence(`${rhystic[1]}.`, sentenceCtx);
    // "Target creature of an opponent's choice [they control]" (Evangelize,
    // Volcanic Offering): read without the choice, then that slot marked as
    // an opponent's (`opponentChoosesTargets` — rule 601.2c).
    const theirs = rhystic === null && outer.opponentChoosesTargets !== undefined ? opponentChoiceIn(sentence) : null;
    let effect =
      theirs !== null
        ? parseSentence(theirs.sentence, sentenceCtx)
        : rhystic === null
        ? parseSentence(sentence, sentenceCtx)
        : inner === null
          ? null
          : {
              kind: "unless",
              chooser: "any-player",
              options: [
                rhystic[2] === "{X}"
                  ? { payGeneric: "x", text: "Pay {X}" }
                  : { pay: rhystic[2], text: `Pay ${rhystic[2]}` },
              ],
              otherwise: inner,
            };
    if (theirs !== null && effect !== null && !containsUndefined(effect)) {
      for (const { occurrence, theyControl } of theirs.slots) {
        const slot = before + occurrence;
        const spec = theyControl ? chooserControlled(ctx.targets[slot]) : ctx.targets[slot];
        if (spec === null || spec === undefined) {
          effect = null;
          break;
        }
        ctx.targets[slot] = spec;
        outer.opponentChoosesTargets.push(slot);
      }
    }
    if (effect === null || containsUndefined(effect)) {
      ctx.targets.length = before;
      todo.push(sentence);
    } else {
      parsed.push(effect);
      hints.push({ sentence, effect });
    }
  }
  if (todo.length > 0) return { effect: null, todo, hints };
  // "Tap target creature. It doesn't untap during its controller's next untap
  // step": one `tap`, the hold on it, as the two are one thing to the object.
  for (let i = parsed.length - 2; i >= 0; i -= 1) {
    const [tap, hold] = [parsed[i], parsed[i + 1]];
    if (tap.kind === "tap" && hold.kind === "tap" && hold.onlyDoesntUntap === true && tap.doesntUntapNext !== true && tap.target === hold.target) {
      const { onlyDoesntUntap: _only, ...held } = hold;
      parsed.splice(i, 2, held);
    }
  }
  return { effect: parsed.length === 1 ? parsed[0] : { kind: "sequence", effects: parsed }, todo: [], hints: [] };
}

/**
 * "Choose two target creatures controlled by the same player (opponent).
 * That player sacrifices one of them of their choice." (Incriminate) /
 * "Their controller (That player) chooses and sacrifices one of them (those
 * creatures)." then "Return the other to its owner's hand." (Barrin's Spite)
 * or "Put a -1/-1 counter on the other." (Retribution): a
 * `choose-among-targets` by the targets' controller — `{ effect, used }`, or
 * null.
 */
/**
 * Energy paid in an amount the player chooses (rule 107.14): "[Choose
 * target creature.] You get {E}{E}{E}, then you may pay any amount of
 * {E}. ~ deals that much damage to that creature." (Harnessed Lightning)
 * or "You get {E}{E}. Then you may pay one or more {E}. If you do, put that
 * many +1/+1 counters on ~." — a `get-energy` and a `may` with
 * `costEnergyX`, the sentence after it read with X for "that much", "that
 * many" and "the amount of {E} paid this way", "-1/-1 … for each {E} paid
 * this way" -X/-X. "Any amount" applies its effect whatever was paid, so it
 * takes no "if you do"; "one or more" needs one. `{ effects, used }`, or
 * null.
 */
function energyAmountAt(sentences, i, ctx) {
  let j = i;
  const chosen = /^choose target (creature|artifact|permanent)\.$/i.exec(sentences[j] ?? "");
  if (chosen !== null) j += 1;
  const got = /^you get ((?:\{E\})+)(?:, then you may pay (any amount of|one or more) \{E\})?\.$/i.exec(sentences[j] ?? "");
  if (got === null) return null;
  let how = got[2];
  j += 1;
  if (how === undefined) {
    const then = /^then you may pay (any amount of|one or more) \{E\}\.$/i.exec(sentences[j] ?? "");
    if (then === null) return null;
    how = then[1];
    j += 1;
  }
  const energyX = how.toLowerCase().startsWith("any") ? "any" : "one-or-more";
  const follow = sentences[j];
  if (follow === undefined) return null;
  const lead = /^if you do, (.+)$/i.exec(follow);
  if ((energyX === "one-or-more") !== (lead !== null)) return null;
  let text = lead === null ? follow : `${lead[1][0].toUpperCase()}${lead[1].slice(1)}`;
  if (chosen !== null) {
    const that = new RegExp(`\\b(?:that|the) ${chosen[1]}\\b`, "i");
    if (!that.test(text)) return null;
    text = text.replace(that, `target ${chosen[1].toLowerCase()}`);
    text = `${text[0].toUpperCase()}${text.slice(1)}`;
  }
  let perEach = false;
  text = text.replace(/ for each \{E\} paid this way\.$/i, () => {
    perEach = true;
    return ".";
  });
  text = text.replace(/\bthat (?:much|many)\b/gi, "X").replace(/\bthe amount of \{E\} paid this way\b/gi, "X");
  const before = ctx.targets.length;
  const inner = parseSentence(text, ctx);
  const fail = () => {
    ctx.targets.length = before;
    return null;
  };
  if (inner === null || containsUndefined(inner)) return fail();
  if (chosen !== null && ctx.targets.length !== before + 1) return fail();
  let effect = inner;
  if (perEach) {
    if (inner.kind !== "modify-pt" || typeof inner.power !== "number" || typeof inner.toughness !== "number") return fail();
    effect = { ...inner, power: { product: ["x", inner.power] }, toughness: { product: ["x", inner.toughness] } };
  } else if (!JSON.stringify(inner).includes('"x"')) {
    return fail();
  }
  const may = {
    kind: "may",
    prompt: energyX === "any" ? "Pay any amount of {E}?" : "Pay one or more {E}?",
    costEnergyX: energyX,
    effect,
  };
  return { effects: [{ kind: "get-energy", amount: got[1].length / 3 }, may], used: j + 1 - i };
}

/**
 * A removal of counters, then "that many" / "that much" in the next
 * sentence: "Remove all +1/+1 counters from target creature you control.
 * Draw that many cards." (Take), "Target player loses all poison counters.
 * ~ deals that much damage to that player." (Leeches) — the count is the
 * resolution's `thisWay: "counters-removed"` (a player's counters included,
 * rule 122.1). `{ effects, used }`, or null.
 */
function countersRemovedAt(sentences, i, ctx) {
  const next = sentences[i + 1];
  if (next === undefined || /\bX\b/.test(next) || !/\bthat (?:many|much)\b/i.test(next)) return null;
  if (!/^(?:remove|target (?:player|opponent) loses all|you lose all)\b/i.test(sentences[i])) return null;
  const before = ctx.targets.length;
  const fail = () => {
    ctx.targets.length = before;
    return null;
  };
  const removal = parseSentence(sentences[i], ctx);
  if (removal === null || containsUndefined(removal)) return fail();
  if (!["remove-counter", "remove-counter-all", "remove-player-counters"].includes(removal.kind)) return fail();
  // "…to that player": the player the removal targeted, read as a target of
  // its own and folded back onto that slot.
  const thatPlayer = typeof removal.target === "number" && /\bthat player\b/i.test(next);
  const text = next.replace(/\bthat (?:many|much)\b/gi, "X").replace(/\bthat player\b/i, "target player");
  const own = ctx.targets.length;
  const inner = parseSentence(text, ctx);
  if (inner === null || containsUndefined(inner) || !JSON.stringify(inner).includes('"x"')) return fail();
  if (thatPlayer && ctx.targets.length !== own + 1) return fail();
  if (thatPlayer) ctx.targets.length = own;
  const removed = { thisWay: "counters-removed" };
  const swap = (v, key) =>
    v === "x"
      ? removed
      : thatPlayer && key === "target" && v === own
        ? removal.target
        : Array.isArray(v)
          ? v.map((w) => swap(w))
          : v !== null && typeof v === "object"
            ? Object.fromEntries(Object.entries(v).map(([k, w]) => [k, swap(w, k)]))
            : v;
  return { effects: [removal, swap(inner)], used: 2 };
}

/**
 * "Choose two target creatures that share no creature types. Those
 * creatures fight each other." (Rivals' Duel) / "Choose any number of
 * target creatures with equal toughness. Destroy the chosen creatures."
 * (V.A.T.S.): the targets a related pair or group (`quantifiedSlots`), then
 * what's done to them — `{ effect, used }`, or null.
 */
function chosenTargetsAt(sentences, i, ctx) {
  const s = (k) => sentences[i + k] ?? "";
  const m = /^choose ((?:two|any number of) target .+)\.$/i.exec(s(0));
  if (m === null) return null;
  const fight = /^those creatures fight each other\.$/i.test(s(1));
  const act = /^(destroy|exile|tap) the chosen creatures\.$/i.exec(s(1));
  if (!fight && act === null) return null;
  const before = ctx.targets.length;
  const got = quantifiedSlots(m[1], ctx);
  const undo = () => {
    ctx.targets.length = before;
    return null;
  };
  if (got === undefined) return undo();
  if (fight) {
    if (got.group || got.slots.length !== 2) return undo();
    return { effect: { kind: "fight", a: got.slots[0], b: got.slots[1] }, used: 2 };
  }
  if (!got.group) return undo();
  const kind = act[1].toLowerCase();
  return {
    effect: {
      kind: "for-each-target",
      from: got.slots[0],
      ...(kind === "tap" ? {} : { simultaneous: true }),
      effect: { kind, target: got.slots[0] },
    },
    used: 2,
  };
}

/**
 * A graveyard card chosen by when it was put there, then moved: "Choose
 * target creature card in a graveyard that was put there from the
 * battlefield this turn. Put that card onto the battlefield under your
 * control." (Grim Return), "… in your graveyard that was put there from
 * anywhere this turn. Return it to your hand." (Night Nurse), "… in an
 * opponent's graveyard that was put there from their library this turn. Put
 * it onto the battlefield under your control." (Captain N'ghathrod). The
 * origin is `CardFilter.putIntoGraveyardThisTurn` (`from`), or the older
 * `putIntoGraveyardFromLibraryThisTurn` for a library.
 */
/** What "all [these] cards" names, for a return from a graveyard: a type
 * phrase ("creature", "permanent"), or an "and" list of card types ("artifact
 * and creature", "artifact, creature, enchantment, and land"), each a card of
 * any one of them. */
function graveyardReturnTypes(phrase) {
  const list = /^(\w+(?:, \w+)*),? and (\w+)$/.exec(phrase);
  if (list === null) return parseTypePhrase(phrase, { cards: true });
  const types = [...list[1].split(", "), list[2]];
  return types.every((t) => CARD_TYPES.includes(t)) ? { typesAnyOf: types } : null;
}

/** The other creature of a block, as `CardFilter.blockedThisTurn`'s `partner`
 * reads it: "a legendary creature", "a blue creature", "a Zombie". */
function blockPartnerPhrase(phrase) {
  if (/^a legendary creature$/i.test(phrase)) return { supertype: "legendary" };
  const m = /^an? (\w+)(?: creature)?$/.exec(phrase);
  if (m === null) return null;
  const color = COLOR_WORD[m[1].toLowerCase()];
  if (color !== undefined) return /creature$/.test(phrase) ? { colors: [color] } : null;
  return /^[A-Z][a-z]+$/.test(m[1]) && !/creature$/.test(phrase) ? { subtype: m[1] } : null;
}

/**
 * "Choose target creature. At this turn's next end of combat, destroy all
 * creatures that blocked or were blocked by it this turn." (Venomous Breath),
 * "Choose target Wall creature. At this turn's next end of combat, destroy all
 * creatures that were blocked by that creature this turn." (Glyph of Doom): the
 * delayed ability reads the turn's blocks, "it" fixed as it's set up.
 */
/** "Take an extra turn after this one", and what the next sentences say about
 * that turn: "Skip the untap step of that turn" (Savor the Moment), "During
 * that turn, damage can't be prevented" (Alchemist's Gambit), "At the
 * beginning of that turn's end step, you lose the game" (Warrior's Oath). */
function extraTurnScopeAt(sentences, i) {
  if (!/^(?:you )?take an extra turn after this one\.$/i.test(sentences[i] ?? "")) return null;
  const effect = { kind: "take-extra-turn" };
  const thatTurn = {};
  let used = 1;
  for (;;) {
    const next = sentences[i + used] ?? "";
    if (/^skip the untap step of that turn\.$/i.test(next)) effect.skipUntapStep = true;
    else if (/^during that turn, damage can't be prevented\.$/i.test(next)) thatTurn.damageCantBePrevented = true;
    else if (/^at the beginning of that turn's end step, you lose the game\.$/i.test(next)) {
      thatTurn.atEndStep = { effect: { kind: "lose-game" }, text: "At the beginning of that turn's end step, you lose the game." };
    } else break;
    used += 1;
  }
  if (used === 1) return null;
  if (Object.keys(thatTurn).length > 0) effect.thatTurn = thatTurn;
  return { effect, used };
}

/**
 * Whole hands exiled face down, and the delayed ability about them: "each
 * player exiles all cards from their hand face down and draws seven cards. At
 * the beginning of the next end step, each player discards their hand and
 * returns to their hand each card they exiled this way" (Memory Jar), "exile
 * all cards from your hand face down. At the beginning of the next end step,
 * return those cards to your hand, then draw a card" (Ignorant Bliss), "target
 * player exiles all cards from their hand face down. At the beginning of the
 * end step of that player's next turn, that player returns those cards to
 * their hand" (Suppress). A sentence alone might be linked to another ability
 * of its card, which it can't see, so only the pairs are read.
 */
function handsFaceDownAt(sentences, i, ctx) {
  const first = (sentences[i] ?? "").toLowerCase();
  const next = (sentences[i + 1] ?? "").toLowerCase();
  const back = {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0, from: "exile" },
  };
  const exile = (target) => ({ kind: "exile-graveyard", target, fromHand: "only", faceDown: true });
  if (
    first === "each player exiles all cards from their hand face down and draws seven cards." &&
    next === "at the beginning of the next end step, each player discards their hand and returns to their hand each card they exiled this way."
  ) {
    return {
      effects: [
        exile("each-player"),
        { kind: "draw", amount: 7, who: "each-player" },
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          about: "exiled",
          orNone: true,
          effect: { kind: "sequence", effects: [{ kind: "discard-hand", who: "each-player" }, back] },
          text: "Each player discards their hand and returns to their hand each card they exiled this way.",
        },
      ],
      used: 2,
    };
  }
  if (
    first === "exile all cards from your hand face down." &&
    next === "at the beginning of the next end step, return those cards to your hand, then draw a card."
  ) {
    return {
      effects: [
        exile("you"),
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          about: "exiled",
          orNone: true,
          effect: { kind: "sequence", effects: [back, { kind: "draw", amount: 1 }] },
          text: "Return those cards to your hand, then draw a card.",
        },
      ],
      used: 2,
    };
  }
  if (
    first === "target player exiles all cards from their hand face down." &&
    next === "at the beginning of the end step of that player's next turn, that player returns those cards to their hand."
  ) {
    const target = ctx.target("player");
    return {
      effects: [
        exile(target),
        {
          kind: "delayed-trigger",
          at: "your-next-turn-end-step",
          turnOf: { target },
          about: "exiled",
          effect: back,
          text: "That player returns those cards to their hand.",
        },
      ],
      used: 2,
    };
  }
  // "Create … token. Exile that token when ~ leaves the battlefield. Sacrifice
  // ~ when that token leaves the battlefield" (Stangg); "… When that token
  // leaves the battlefield, put the exiled card into your hand" (Ugin, the
  // Ineffable); "Return ~ to the battlefield under its owner's control when
  // that token dies" (Tatsumasa, the Dragon's Fang).
  const onLeaving = (at, effect, text, about) => ({
    effects: [{ kind: "delayed-trigger", at, ...(about !== undefined ? { about } : {}), effect, text }],
    used: 1,
  });
  const LEAVING = ["graveyard", "exile", "hand", "library", "command"];
  if (/^exile that token when ~ leaves the battlefield\.$/i.test(first)) {
    return onLeaving({ leaves: "source", to: LEAVING }, { kind: "exile", target: 0 }, "Exile that token when ~ leaves the battlefield.", "created");
  }
  if (/^sacrifice ~ when that token leaves the battlefield\.$/i.test(first)) {
    return onLeaving({ leaves: "created", to: LEAVING }, { kind: "sacrifice-source" }, "Sacrifice ~ when that token leaves the battlefield.");
  }
  if (/^when that token leaves the battlefield, put the exiled card into your hand\.$/i.test(first)) {
    return onLeaving(
      { leaves: "created", to: LEAVING },
      { kind: "return-to-hand", target: 0, from: "exile" },
      "When that token leaves the battlefield, put the exiled card into your hand.",
      "exiled",
    );
  }
  if (/^return ~ to the battlefield under its owner's control when that token dies\.$/i.test(first)) {
    return onLeaving(
      { leaves: "created", to: ["graveyard"] },
      { kind: "put-onto-battlefield", target: "source" },
      "Return ~ to the battlefield under its owner's control when that token dies.",
    );
  }
  // "Create a Lander token. At the beginning of the end step on your next
  // turn, sacrifice that token" (Kav Landseeker).
  if (first === "at the beginning of the end step on your next turn, sacrifice that token.") {
    return {
      effects: [
        {
          kind: "delayed-trigger",
          at: "your-next-turn-end-step",
          about: "created",
          effect: { kind: "sacrifice-target", target: 0 },
          text: "Sacrifice that token.",
        },
      ],
      used: 1,
    };
  }
  return null;
}

function blocksAtEndOfCombatAt(sentences, i, ctx) {
  const choose = /^[Cc]hoose target (?:([A-Z][a-z]+) )?creature\.$/.exec(sentences[i] ?? "");
  if (choose === null) return null;
  const then = /^at this turn's next end of combat, destroy all creatures that (blocked or were blocked by it|were blocked by that creature) this turn\.$/i.exec(sentences[i + 1] ?? "");
  if (then === null) return null;
  const target = ctx.target(
    choose[1] === undefined ? "creature" : { kind: "permanent", filter: { type: "creature", subtype: choose[1] } },
  );
  const relation = then[1].startsWith("blocked or") ? "either" : "blocked-by";
  return {
    effect: {
      kind: "delayed-trigger",
      at: "end-of-combat-this-turn",
      effect: { kind: "destroy-all", filter: { type: "creature", blockedThisTurn: { relation, of: target } } },
      text: `Destroy all creatures that ${then[1]} this turn.`,
    },
    used: 2,
  };
}

function graveyardArrivalAt(sentences, i, ctx) {
  const m = /^choose target (?:(.+?) )?card in (your|a|an opponent's) graveyard that was put there from (the battlefield|a library|their library|anywhere) this turn\.$/i.exec(sentences[i] ?? "");
  if (m === null) return null;
  const then = /^(?:(put) (?:it|that card) onto the battlefield under your control|(return) (?:it|that card) to (?:your|its owner's) hand)\.$/i.exec(sentences[i + 1] ?? "");
  if (then === null) return null;
  const types = m[1] === undefined ? {} : parseTypePhrase(m[1], { cards: true });
  if (types === null) return null;
  const origin = m[3].toLowerCase();
  const arrival =
    origin === "anywhere"
      ? { putIntoGraveyardThisTurn: {} }
      : origin === "the battlefield"
        ? { putIntoGraveyardThisTurn: { from: ["battlefield"] } }
        : { putIntoGraveyardFromLibraryThisTurn: true };
  const whose = { your: "you", a: "any", "an opponent's": "opponent" }[m[2].toLowerCase()];
  const target = ctx.target({ kind: "card-in-graveyard", whose, filter: { ...types, ...arrival } });
  const effect =
    then[1] !== undefined
      ? { kind: "put-onto-battlefield", target, underYourControl: true }
      : { kind: "return-to-hand", target, from: "graveyard" };
  return { effect, used: 2 };
}

/**
 * "… This ability costs {1}{U} less to activate if …" on an activated ability's
 * line: the line without it and the ability's `costReduction`, or `null` when
 * there's none or the condition isn't one read here (the sentence then stays,
 * for a person).
 */
function abilityReductionOf(line) {
  const m = / This ability costs ((?:\{[^}]+\})+) less to activate (during your turn|if [^.]+)\.( Activate [^.]+\.)?$/.exec(line);
  if (m === null) return null;
  let reduceGeneric = 0;
  let reduceColored = "";
  for (const symbol of m[1].match(/\{[^}]+\}/g)) {
    if (/^\{\d+\}$/.test(symbol)) reduceGeneric += Number(symbol.slice(1, -1));
    else if (/^\{[WUBRG]\}$/.test(symbol)) reduceColored += symbol;
    else return null;
  }
  const condition = abilityReductionCondition(m[2]);
  if (condition === undefined) return null;
  return {
    rest: line.slice(0, m.index) + (m[3] ?? ""),
    costReduction: { reduceGeneric, ...(reduceColored !== "" ? { reduceColored } : {}), condition },
  };
}

function abilityReductionCondition(clause) {
  if (clause === "during your turn") return { kind: "your-turn" };
  if (clause === "if you're the monarch") return { kind: "monarch", who: "you" };
  let m;
  if ((m = new RegExp(`^if you have ${N} or fewer cards in hand$`, "i").exec(clause))) {
    const atMost = numberOf(m[1]);
    return typeof atMost === "number" ? { kind: "hand-size", atMost } : undefined;
  }
  if ((m = new RegExp(`^if you've drawn ${N} or more cards this turn$`, "i").exec(clause))) {
    const atLeast = numberOf(m[1]);
    return typeof atLeast === "number" ? { kind: "turn-stat", stat: "cards-drawn", who: "you", atLeast } : undefined;
  }
  if ((m = new RegExp(`^if an opponent controls ${N} or more (.+)$`, "i").exec(clause))) {
    const atLeast = numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    return typeof atLeast === "number" && filter !== null ? { kind: "opponent-controls", filter, atLeast } : undefined;
  }
  if ((m = /^if you control an? (.+)$/i.exec(clause))) {
    const filter = parseTypePhrase(m[1]);
    return filter !== null ? { kind: "controls", filter, atLeast: 1 } : undefined;
  }
  return undefined;
}

/**
 * "Each opponent discards a card. Each opponent who can't loses 3 life."
 * (Entropic Battlecruiser), "… For each opponent who can't, you gain 4 life."
 * (Cruel Grimnarch), "Each player sacrifices a creature or planeswalker of
 * their choice. Each player who can't discards a card." (Plaguecrafter):
 * `for-each-player`'s `before`, those who can't found first.
 */
function whoCantAt(sentences, i) {
  const first = sentences[i] ?? "";
  const then = sentences[i + 1] ?? "";
  if (new RegExp(`^Each opponent discards a card\\.$`, "i").test(first)) {
    const base = {
      kind: "for-each-player",
      who: "each-opponent",
      whoIf: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 0 } },
      before: { kind: "discard", target: "each-opponent", amount: 1 },
    };
    const loses = new RegExp(`^Each opponent who can't loses ${N} life\\.$`, "i").exec(then);
    if (loses !== null) {
      const n = numberOf(loses[1]);
      if (typeof n !== "number") return null;
      return { effect: { ...base, effect: { kind: "lose-life", amount: n, who: "that-player" } }, used: 2 };
    }
    const gains = new RegExp(`^For each opponent who can't, you gain ${N} life\\.$`, "i").exec(then);
    if (gains !== null) {
      const n = numberOf(gains[1]);
      if (typeof n !== "number") return null;
      return { effect: { ...base, effect: { kind: "gain-life", amount: n } }, used: 2 };
    }
    return null;
  }
  if (
    /^Each player sacrifices a creature or planeswalker of their choice\.$/i.test(first) &&
    /^Each player who can't discards a card\.$/i.test(then)
  ) {
    const filter = { typesAnyOf: ["creature", "planeswalker"] };
    return {
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "not", of: { kind: "controls", filter, atLeast: 1 } },
        },
        before: { kind: "sacrifice", who: "each-player", filter, count: 1 },
        choicesHeld: true,
        effect: { kind: "discard", target: "that-player", amount: 1 },
      },
      used: 2,
    };
  }
  return null;
}

function amongTargetsAt(sentences, i, ctx) {
  const s = (k) => sentences[i + k] ?? "";
  const m = /^choose two target creatures controlled by the same (player|opponent)\.$/i.exec(s(0));
  if (m === null) return null;
  const sacrifice = { effect: { kind: "sacrifice-target", target: 0, byItsController: true } };
  let used;
  let rest;
  if (/^that player sacrifices one of them of their choice\.$/i.test(s(1))) used = 2;
  else if (/^(?:their controller|that player) chooses and sacrifices one of (?:them|those creatures)\.$/i.test(s(1))) {
    used = 2;
    if (/^return the other to its owner's hand\.$/i.test(s(2))) {
      rest = "hand";
      used = 3;
    } else if (/^put a -1\/-1 counter on the other\.$/i.test(s(2))) {
      rest = { effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 } };
      used = 3;
    }
  } else return null;
  const spec = m[1].toLowerCase() === "opponent" ? "creature-an-opponent-controls" : "creature";
  const first = ctx.target(spec);
  ctx.target({ kind: "other", of: spec, than: { slot: first }, sameController: true });
  return {
    effect: {
      kind: "choose-among-targets",
      chooser: "their-controller",
      count: 1,
      chosen: sacrifice,
      ...(rest !== undefined ? { rest } : {}),
    },
    used,
  };
}

/**
 * The "target … of an opponent's choice [they control]" slots of a sentence
 * (rule 601.2c — `opponentChoosesTargets`): which "target" of the sentence
 * each is (its occurrence, counted from 0), and the sentence without the
 * choice — "they control" read as "you control" for now, the slot then
 * turned into the chooser's (`chooserControlled`). Null when there's none.
 */
function opponentChoiceIn(sentence) {
  const choice = / of an opponent's choice( they control)?/g;
  if (!choice.test(sentence)) return null;
  choice.lastIndex = 0;
  const slots = [];
  let m;
  while ((m = choice.exec(sentence)) !== null) {
    const occurrence = (sentence.slice(0, m.index).match(/\btarget\b/gi) ?? []).length - 1;
    if (occurrence < 0) return null;
    slots.push({ occurrence, theyControl: m[1] !== undefined });
  }
  return { sentence: sentence.replace(/ of an opponent's choice( they control)?/g, (_m, they) => (they ? " you control" : "")), slots };
}

/** A "… you control" target slot read for "they control" of an opponent's
 * choice: controlled by the player choosing it (`controlledBy: "chooser"`). */
function chooserControlled(spec) {
  if (spec === "creature-you-control") return { kind: "permanent", filter: { type: "creature", controlledBy: "chooser" } };
  if (typeof spec === "object" && spec?.kind === "permanent" && spec.filter?.controlledBy === "you") {
    return { ...spec, filter: { ...spec.filter, controlledBy: "chooser" } };
  }
  return null;
}

/**
 * A search of another player's zones at `sentences[i]` (`search-library`'s
 * `whose` — rule 701.23): optionally after "Choose a [nonland] card name."
 * (then a `choose-card-name` around it), and always followed by "Then that
 * player shuffles." or "That player shuffles, then draws a card for each card
 * exiled from their hand this way." — `{ effect, used }` (the sentences it
 * took), or null.
 */
function searchInsteadAt(sentences, i) {
  // A search whose finds go card by card (`search-library`'s `instead`).
  // "Search your library for up to two creature cards and reveal them. Put
  // one into your hand and the other into your graveyard. Then shuffle."
  // (Jarad's Orders, Fork in the Road): exactly one to the hand.
  const split = /^search your library for up to two (.+?) cards and reveal them\.$/i.exec(sentences[i] ?? "");
  if (
    split !== null &&
    /^put one into your hand and the other into your graveyard\.$/i.test(sentences[i + 1] ?? "") &&
    /^then shuffle\.$/i.test(sentences[i + 2] ?? "")
  ) {
    const filter = parseTypePhrase(split[1], { cards: true });
    if (filter === null) return null;
    return {
      effect: {
        kind: "search-library",
        filter,
        destination: "graveyard",
        min: 0,
        max: 2,
        reveal: true,
        instead: { destination: "hand", pick: "one" },
      },
      used: 3,
    };
  }
  // "[You may s]earch your library for an artifact card and reveal it. Put
  // it onto the battlefield [tapped] if its mana value is 2 or less / if
  // it's a land card. Otherwise, put it into your hand. Then shuffle. / If
  // you search your library this way, shuffle." (Guidelight Pathmaker,
  // Archdruid's Charm): read from the card, no choice.
  const one = /^(you may )?search your library for an? (.+?) card and reveal it\.$/i.exec(sentences[i] ?? "");
  const put = /^put it onto the battlefield( tapped)? if (?:its mana value is (\d+) or less|it's an? (.+?) card)\.$/i.exec(
    sentences[i + 1] ?? "",
  );
  if (one === null || put === null || !/^otherwise, put it into your hand\.$/i.test(sentences[i + 2] ?? "")) return null;
  const shuffle = sentences[i + 3] ?? "";
  if (!(one[1] ? /^if you search your library this way, shuffle\.$/i : /^then shuffle\.$/i).test(shuffle)) return null;
  const filter = parseTypePhrase(one[2], { cards: true });
  const which = put[2] !== undefined ? { manaValue: { op: "lte", n: Number(put[2]) } } : parseTypePhrase(put[3], { cards: true });
  if (filter === null || which === null) return null;
  const search = {
    kind: "search-library",
    filter,
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
    instead: { destination: "battlefield", ...(put[1] ? { enterTapped: true } : {}), filter: which, pick: "all" },
  };
  return {
    effect: one[1] ? { kind: "may", prompt: `Search your library for ${/^[aeiou]/i.test(one[2]) ? "an" : "a"} ${one[2]} card?`, effect: search } : search,
    used: 4,
  };
}

/**
 * A search of your own zones over two sentences, or null:
 * - "[You may s]earch your graveyard, hand, and/or library for a card named X
 *   and put it onto the battlefield [attached to this creature]. If you search
 *   your library this way, shuffle." (Boonweaver Giant, Dark Supplicant): the
 *   zones chosen as it resolves (`searchZonesAndOr`);
 * - "Search your library and/or graveyard for up to five Doctor cards, reveal
 *   them, and put them into your hand. If you search your library this way,
 *   shuffle." (The Five Doctors): the same, "up to" holding in a graveyard too
 *   (`upTo`);
 * - "Search your library and graveyard for five cards and exile the rest. Put
 *   the chosen cards on top of your library in any order." (Doomsday).
 */
function searchZonesAt(sentences, i) {
  if (
    /^search your library and graveyard for five cards and exile the rest\.$/i.test(sentences[i] ?? "") &&
    /^put the chosen cards on top of your library in any order\.$/i.test(sentences[i + 1] ?? "")
  ) {
    return {
      effect: {
        kind: "search-library",
        zones: "library-and-graveyard",
        filter: {},
        destination: "library-top",
        min: 5,
        max: 5,
        exileRest: true,
        inAnyOrder: true,
      },
      used: 2,
    };
  }
  const upTo =
    /^search your ((?:graveyard|library|hand)(?:, (?:graveyard|library|hand),?| ) ?and\/or (?:graveyard|library|hand)) for up to (\w+) (.+?) cards, reveal them, and put them into your hand\.$/i.exec(
      sentences[i] ?? "",
    );
  if (upTo !== null && /^if you search your library this way, shuffle\.$/i.test(sentences[i + 1] ?? "")) {
    const max = numberOf(upTo[2]);
    const filter = parseTypePhrase(upTo[3], { cards: true });
    if (typeof max !== "number" || filter === null || filter === undefined) return null;
    return {
      effect: searchZonesAndOr(upTo[1].toLowerCase().match(/graveyard|library|hand/g), {
        kind: "search-library",
        filter,
        destination: "hand",
        min: 0,
        max,
        upTo: true,
        reveal: true,
      }),
      used: 2,
    };
  }
  const m =
    /^(you may )?search your ((?:graveyard|library|hand)(?:, (?:graveyard|library|hand),?| ) ?and\/or (?:graveyard|library|hand)) for (.+?) and put it onto the battlefield( attached to this (?:creature|equipment))?\.$/i.exec(
      sentences[i] ?? "",
    );
  if (m === null || !/^if you search your library this way, shuffle\.$/i.test(sentences[i + 1] ?? "")) return null;
  const zones = m[2].toLowerCase().match(/graveyard|library|hand/g);
  // With only the library and the graveyard, the older cards spell the modes out.
  if (!zones.includes("hand")) return null;
  const what = m[3];
  let filter;
  let n;
  if ((n = /^a card named (.+)$/i.exec(what))) {
    if (/ and\/or /i.test(n[1])) return null;
    filter = { name: n[1] };
  } else if (/^a card with the same name as that spell$/i.test(what)) filter = { sameNameAsTriggerObject: true };
  else if ((n = /^an? (.+?) card$/i.exec(what))) filter = parseTypePhrase(n[1], { cards: true });
  if (filter === undefined || filter === null) return null;
  const search = searchZonesAndOr(zones, {
    kind: "search-library",
    filter,
    destination: "battlefield",
    ...(m[4] ? { attachedToSource: true } : {}),
    min: 0,
    max: 1,
  });
  return {
    effect: m[1] ? { kind: "may", prompt: `Search your ${m[2]} for ${what}?`, effect: search } : search,
    used: 2,
  };
}

function searchOthersAt(sentences, i, ctx) {
  let at = i;
  let named = null;
  const nameM = /^choose (?:a|an) ((?:[\w-]+, )*[\w-]+ )?card name\.$/i.exec(sentences[at] ?? "");
  if (nameM !== null) {
    named = cardNameFilterOf(nameM[1] ?? "");
    if (named === null) return null;
    at += 1;
  }
  const m = /^search (target player's|target opponent's|its controller's|its owner's|that player's) (graveyard, hand, and library|library) for (.+?) and (exile (?:it|them)(?: face down)?|put (?:it|that card) onto the battlefield under your control|put them into (?:their|that player's) graveyard)\.$/i.exec(sentences[at] ?? "");
  if (m === null) return null;
  const shuffleM = /^(?:then (?:that|the) player shuffles|that player shuffles, then draws a card for each card exiled from their hand this way)\.$/i.exec(sentences[at + 1] ?? "");
  if (shuffleM === null) return null;
  const zones = m[2].toLowerCase() === "library" ? undefined : "graveyard-hand-library";

  // How many, of what: "a card" (a quantity, rule 701.23d), "an artifact
  // card", "three cards", "up to seven cards", "all cards with that name",
  // "any number of cards with the same name as that spell".
  const what = m[3].toLowerCase();
  let count;
  let rest;
  let cm;
  if ((cm = /^all cards (.+)$/.exec(what))) [count, rest] = [{ all: true, min: 0, max: 99 }, cm[1]];
  else if ((cm = /^any number of cards (.+)$/.exec(what))) [count, rest] = [{ min: 0, max: 99 }, cm[1]];
  else if ((cm = /^up to (\w+) (.*?)cards?(?: (.+))?$/.exec(what))) {
    const n = numberOf(cm[1]);
    if (typeof n !== "number") return null;
    count = { min: 0, max: n, quality: cm[2].trim() };
    rest = cm[3] ?? "";
  } else if ((cm = /^a card(?: (.+))?$/.exec(what))) [count, rest] = [{ min: cm[1] ? 0 : 1, max: 1 }, cm[1] ?? ""];
  else if ((cm = /^an? (.+?) card$/.exec(what))) [count, rest] = [{ min: 0, max: 1, quality: cm[1] }, ""];
  else if ((cm = /^(\w+) cards$/.exec(what))) {
    const n = numberOf(cm[1]);
    if (typeof n !== "number") return null;
    [count, rest] = [{ min: n, max: n }, ""];
  } else return null;
  let filter = {};
  if (count.quality) {
    filter = parseTypePhrase(count.quality, { cards: true });
    if (filter === null) return null;
  }
  // "With that name" needs the name chosen; "with the same name as that
  // spell" the one target before.
  if (rest === "with that name" || rest === "with the chosen name") {
    if (named === null) return null;
    filter = { ...filter, hasName: CHOSEN_CARD_NAME };
  } else if (/^with the same name as that (spell|card|creature|artifact|enchantment|land|permanent)$/.test(rest)) {
    if (named !== null || ctx.targets.length !== 1) return null;
    filter = { ...filter, sameNameAsTarget: 0 };
  } else if (rest !== "" || named !== null) return null;

  // Whose: a new player target, or the one target before's controller,
  // owner or player.
  const owner = m[1].toLowerCase();
  let whose;
  if (owner === "target player's") whose = { target: ctx.target("player") };
  else if (owner === "target opponent's") whose = { target: ctx.target("opponent") };
  else if (ctx.targets.length !== 1) return null;
  else if (owner === "its controller's") whose = { controllerOfTarget: 0 };
  else if (owner === "its owner's") whose = { ownerOfTarget: 0 };
  else if (ctx.targets[0] === "player" || ctx.targets[0] === "opponent") whose = { target: 0 };
  else return null;

  const how = m[4].toLowerCase();
  const destination = how.startsWith("exile") ? (how.endsWith("face down") ? "exile-face-down" : "exile") : how.includes("battlefield") ? "battlefield" : "graveyard";
  const search = {
    kind: "search-library",
    whose,
    ...(zones !== undefined ? { zones } : {}),
    filter,
    destination,
    ...(count.all ? { all: true } : {}),
    min: count.min,
    max: count.max,
    ...(/draws a card/i.test(shuffleM[0])
      ? { then: { kind: "draw", who: "that-player", amount: { thisWay: "exiled-from-hand" } } }
      : {}),
  };
  const effect = named === null ? search : { kind: "choose-card-name", ...(Object.keys(named).length > 0 ? { filter: named } : {}), then: search };
  return { effect, used: at - i + 2 };
}

/** A one-unit effect done "for each" of `amount` instead — parley's create a
 * token, put a counter, +1/+1 to all, add a mana, gain a life — or null. */
/**
 * Two sentences that are one effect over the cards exiled with the source
 * (rule 607.2a), or a cost and what it pays for — or `null`:
 * - "Choose a card exiled with ~. You may play that card this turn." (Muse
 *   Vessel): `choose-exiled-to-play`'s `linked`;
 * - "Roll a d10. Return up to X cards from among cards exiled with ~ to their
 *   owners' hands, where X is the result." (Bag of Devouring);
 * - "You may pay {4} and 2 life. If you do, return a card exiled with ~ to the
 *   battlefield." (Purgatory): a `may` with its `cost` and `costLife`.
 */
function forcedAttackAt(sentences, i, ctx) {
  const m = /^choose target (?:non-([A-Z][a-z]+) )?creature the active player has controlled continuously since the beginning of the turn\.$/i.exec(sentences[i]);
  if (
    m === null ||
    !/^that creature attacks this turn if able\.$/i.test(sentences[i + 1] ?? "") ||
    !/^destroy it at the beginning of the next end step if it didn't attack this turn\.$/i.test(sentences[i + 2] ?? "")
  ) {
    return null;
  }
  const filter = {
    type: "creature",
    ...(m[1] !== undefined ? { notSubtypes: [m[1]] } : {}),
    controlledBy: "active-player",
    controlledContinuously: true,
  };
  const target = ctx.target({ kind: "permanent", filter });
  return {
    effect: {
      kind: "sequence",
      effects: [
        { kind: "restrict", target, restrictions: ["must-attack"] },
        {
          kind: "delayed-trigger",
          at: "next-end-step",
          text: "Destroy it if it didn't attack this turn.",
          effect: {
            kind: "conditional",
            condition: { kind: "target", index: target, filter: { attackedThisTurn: false } },
            then: { kind: "destroy", target },
          },
        },
      ],
    },
    used: 3,
  };
}

function exiledCardPickAt(sentences, i, ctx) {
  const first = sentences[i];
  const next = sentences[i + 1] ?? "";
  if (/^choose a card exiled with ~\.$/i.test(first) && /^you may play that card this turn\.$/i.test(next)) {
    return { effect: { kind: "choose-exiled-to-play", linked: true }, used: 2 };
  }
  const roll = /^roll a d(\d+)\.$/i.exec(first);
  if (roll !== null && /^return up to x cards from among cards exiled with ~ to their owners' hands, where x is the result\.$/i.test(next)) {
    return {
      effect: {
        kind: "roll-dice",
        sides: Number(roll[1]),
        then: {
          kind: "look-and-choose",
          zone: "exiled-with-source",
          min: 0,
          max: { roll: "total" },
          destination: "hand",
          leftover: "stay",
        },
      },
      used: 2,
    };
  }
  const pay = /^you may pay ((?:\{[^}]+\})+) and (\d+) life\.$/i.exec(first);
  const done = /^if you do, (.+)$/i.exec(next);
  // "You may pay 2 life. If you do, draw a card." (Sanguine Spy).
  const payLife = /^you may pay (\d+) life\.$/i.exec(first);
  if (payLife !== null && done !== null) {
    const effect = parseSentence(`${done[1][0].toUpperCase()}${done[1].slice(1)}`, ctx);
    if (effect === null || containsUndefined(effect)) return null;
    return { effect: { kind: "may", prompt: `Pay ${payLife[1]} life?`, costLife: Number(payLife[1]), effect }, used: 2 };
  }
  if (pay !== null && done !== null) {
    const effect = parseSentence(`${done[1][0].toUpperCase()}${done[1].slice(1)}`, ctx);
    if (effect === null || containsUndefined(effect)) return null;
    return {
      effect: { kind: "may", prompt: `Pay ${pay[1]} and ${pay[2]} life?`, cost: pay[1], costLife: Number(pay[2]), effect },
      used: 2,
    };
  }
  return null;
}

/**
 * Two sentences that reveal from a hand and act on what was shown, as one
 * effect (rule 701.20a: the cards stay where they are) — or `null`:
 * - "Target player reveals their hand. You gain life equal to the number of
 *   cards in that player's hand." (Search Warrant);
 * - "Target opponent reveals a card at random from their hand. ~ deals damage
 *   equal to that card's mana value to that player." (Planeswalker's Fury,
 *   Ignite Memories), "You gain life equal to that card's mana value."
 *   (Planeswalker's Mirth): the pick goes in the slot beside the player's;
 * - "Reveal up to five nonland cards from your hand. For each of those cards
 *   that has the same mana value as another card revealed this way, create a
 *   Treasure token." (Vault 21: House Gambit);
 * - "You may reveal a Dinosaur card from your hand. If you do or if you
 *   control another Dinosaur, you gain 3 life." (Armored Kincaller).
 */
function handRevealAt(sentences, i, ctx) {
  const first = sentences[i];
  const next = sentences[i + 1] ?? "";
  const targetOf = (phrase) => ctx.target(phrase.toLowerCase() === "target opponent" ? "opponent" : "player");
  if (/^(target player|target opponent) reveals their hand\.$/i.test(first)) {
    if (!/^you gain life equal to the number of cards in that player's hand\.$/i.test(next)) return null;
    const who = targetOf(/^(target player|target opponent)/i.exec(first)[1]);
    return {
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who },
          { kind: "gain-life", amount: { cardsInHand: { target: who } } },
        ],
      },
      used: 2,
    };
  }
  const atRandom = /^(target player|target opponent) reveals a card at random from their hand\.$/i.exec(first);
  if (atRandom !== null) {
    const damage =
      /^~ deals damage to that player equal to that card's mana value\.$/i.test(next) ||
      /^~ deals damage equal to that card's mana value to that player\.$/i.test(next);
    const gain = /^you gain life equal to that card's mana value\.$/i.test(next);
    if (!damage && !gain) return null;
    const who = targetOf(atRandom[1]);
    const picked = who + 1;
    return {
      effect: {
        kind: "choose-random-card",
        zone: "hand",
        whose: who,
        show: "reveal",
        slot: picked,
        then: damage
          ? { kind: "damage", target: who, amount: { manaValueOf: picked } }
          : { kind: "gain-life", amount: { manaValueOf: picked } },
      },
      used: 2,
    };
  }
  const upTo = /^reveal up to (two|three|four|five|six|seven) (.+?) cards from your hand\.$/i.exec(first);
  const sharing = /^for each of those cards that has the same mana value as another card revealed this way, (.+)\.$/i.exec(next);
  if (upTo !== null && sharing !== null) {
    const filter = parseTypePhrase(upTo[2], { cards: true });
    const each = parseSentence(`${sharing[1]}.`, ctx);
    const scaled =
      each === null || containsUndefined(each) ? null : scaledBy(each, { thisWay: "revealed", who: "you", sharingManaValue: true });
    if (filter === null || scaled === null) return null;
    const max = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 }[upTo[1].toLowerCase()];
    return {
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "hand", min: 0, max, ...(Object.keys(filter).length > 0 ? { filter } : {}), destination: "reveal", leftover: "stay" },
          scaled,
        ],
      },
      used: 2,
    };
  }
  const mayReveal = /^you may reveal an? (.+?) card from your hand\.$/i.exec(first);
  const orControl = /^if you do or if you control another (.+?), (.+)\.$/i.exec(next);
  if (mayReveal !== null && orControl !== null) {
    const filter = parseTypePhrase(mayReveal[1], { cards: true });
    const also = parseTypePhrase(orControl[1]);
    const then = parseSentence(`${orControl[2]}.`, ctx);
    if (filter === null || also === null || then === null || containsUndefined(then)) return null;
    return {
      effect: {
        kind: "sequence",
        effects: [
          { kind: "look-and-choose", zone: "hand", min: 0, max: 1, filter, destination: "reveal", leftover: "stay" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "revealed", atLeast: 1 },
            then,
            else: {
              kind: "conditional",
              condition: { kind: "controls", filter: also, atLeast: 1, excludeSelf: true },
              then,
            },
          },
        ],
      },
      used: 2,
    };
  }
  return null;
}

/** "Target opponent reveals their hand. You choose a nonland card from it
 * [and exile that card]. [That player discards that card. | Exile that
 * card.]" — Duress, Thought-Knot Seer: a `discard-chosen`, its card filter
 * read from the type phrase, and a `destination` when the card is exiled.
 * "…a nonland card from it **or a card from their graveyard**. Exile that
 * card." (Agonizing Remorse) is the same choice over the graveyard too
 * (`alsoFrom`); "Target player reveals their hand **and the top card of
 * their library**. You choose a card revealed this way. That player puts the
 * chosen card on the bottom of their library." (Psychotic Episode) over the
 * top card too. Two or three sentences, one effect; `null` when they aren't
 * that. */
function revealedHandChoiceAt(sentences, i, ctx) {
  const some = revealedFromHandChoiceAt(sentences, i, ctx);
  if (some !== null) return some;
  // "Target opponent reveals their hand and you choose a nonland card from it.
  // Exile that card until …" (Brain Maggot): the same two sentences as one.
  const joined = /^(target opponent|target player) reveals their hand and (you choose .+)$/i.exec(sentences[i]);
  if (joined !== null) {
    const split = [...sentences.slice(0, i), `${joined[1]} reveals their hand.`, joined[2], ...sentences.slice(i + 1)];
    const read = revealedHandChoiceAt(split, i, ctx);
    return read === null ? null : { ...read, used: read.used - 1 };
  }
  // "Look at target opponent's hand. You may exile a nonland card from it
  // until ~ leaves the battlefield" (Deep-Cavern Bat, rule 610.3).
  const looked = /^look at (target opponent|target player)'s hand\.$/i.exec(sentences[i]);
  const mayExile = looked === null ? null : /^you may exile an? (?:(.+?) )?card from it until ~ leaves the battlefield\.$/i.exec(sentences[i + 1] ?? "");
  if (mayExile !== null) {
    const lookFilter = mayExile[1] === undefined ? {} : parseTypePhrase(mayExile[1]);
    if (lookFilter === null) return null;
    return {
      effect: {
        kind: "discard-chosen",
        target: ctx.target(looked[1].toLowerCase() === "target opponent" ? "opponent" : "player"),
        ...(Object.keys(lookFilter).length > 0 ? { filter: lookFilter } : {}),
        lookOnly: true,
        optional: true,
        destination: "exile",
        untilSourceLeaves: true,
      },
      used: 2,
    };
  }
  const who = /^(target opponent|target player) reveals their hand( and the top card of their library)?\.$/i.exec(sentences[i]);
  if (who === null) return null;
  const target = () => ctx.target(who[1].toLowerCase() === "target opponent" ? "opponent" : "player");
  if (who[2] !== undefined) {
    if (!/^you choose a card revealed this way\.$/i.test(sentences[i + 1] ?? "")) return null;
    if (!/^that player puts the chosen card on the bottom of their library\.$/i.test(sentences[i + 2] ?? "")) return null;
    return {
      effect: { kind: "discard-chosen", target: target(), destination: "library-bottom", alsoFrom: { zone: "library-top" } },
      used: 3,
    };
  }
  // "You choose a nonland card from that player's graveyard or hand and exile
  // it." (Memory Leak): the one filter over both zones. "You may cast that
  // card for as long as it remains exiled, and you may spend mana as though it
  // were mana of any color to cast that spell." (Psychic Intrusion).
  const either = /^you choose an? (?:(.+?) )?card from that player's graveyard or hand and exile it\.$/i.exec(sentences[i + 1] ?? "");
  if (either !== null) {
    const filter = either[1] === undefined ? {} : parseTypePhrase(either[1]);
    if (filter === null) return null;
    const some = Object.keys(filter).length > 0 ? { filter } : {};
    const castIt =
      /^you may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell\.$/i.test(
        sentences[i + 2] ?? "",
      );
    return {
      effect: {
        kind: "discard-chosen",
        target: target(),
        ...some,
        destination: "exile",
        alsoFrom: { zone: "graveyard", ...some },
        ...(castIt ? { mayCast: { duration: "while-exiled", spendAs: "any-color" } } : {}),
      },
      used: castIt ? 3 : 2,
    };
  }
  const choose =
    /^you choose an? (?:(.+?) )?card from it(?: or an? (?:(.+?) )?card from their graveyard)?( and exile that card)?\.$/i.exec(
      sentences[i + 1] ?? "",
    );
  // "A nonland permanent card" names every permanent type, which the type
  // phrase reader would drop.
  if (choose === null || /\bpermanent\b/i.test(choose[1] ?? "") || /\bpermanent\b/i.test(choose[2] ?? "")) return null;
  const filter = choose[1] === undefined ? {} : parseTypePhrase(choose[1]);
  if (filter === null) return null;
  const orGraveyard = /or an? (?:.+? )?card from their graveyard/i.test(sentences[i + 1]);
  const graveyardFilter = choose[2] === undefined ? {} : parseTypePhrase(choose[2]);
  if (graveyardFilter === null) return null;
  let exile = choose[3] !== undefined;
  let used = 2;
  let until = false;
  if (!exile) {
    const then = /^(that player discards that card|exile that card|that player exiles that card)( until ~ leaves the battlefield)?\.$/i.exec(sentences[i + 2] ?? "");
    if (then === null) return null;
    exile = !/discards/i.test(then[1]);
    until = then[2] !== undefined;
    if (until && !exile) return null;
    used = 3;
  }
  // A graveyard's card can't be discarded: only an exile reads that way.
  if (orGraveyard && !exile) return null;
  const effect = {
    kind: "discard-chosen",
    target: target(),
    ...(Object.keys(filter).length > 0 ? { filter } : {}),
    ...(exile ? { destination: "exile" } : {}),
    ...(until ? { untilSourceLeaves: true } : {}),
    ...(orGraveyard
      ? { alsoFrom: { zone: "graveyard", ...(Object.keys(graveyardFilter).length > 0 ? { filter: graveyardFilter } : {}) } }
      : {}),
  };
  return { effect, used };
}

/** "Target player reveals three cards from their hand and you choose one of
 * them. That player discards that card." (Blackmail): a `discard-chosen` with
 * `reveals`, and `picks` for "you choose two of them" (Noggin Whack). The
 * number may be X, "X …, where X is the number of Faeries you control"
 * (Thieving Sprite) or "a number of cards … equal to the number of Swamps you
 * control" (Mire's Toll). `null` when the sentences aren't that. */
function revealedFromHandChoiceAt(sentences, i, ctx) {
  const m = new RegExp(
    `^(target opponent|target player) reveals (?:${N} cards from their hand(?:, where X is (.+?))?|a number of cards from their hand equal to (.+?))(?: and you choose ${N} of them)?\\.$`,
    "i",
  ).exec(sentences[i]);
  if (m === null) return null;
  const phrase = m[3] ?? m[4];
  const reveals = phrase !== undefined ? dividedTotalOf(phrase) : numberOf(m[2]);
  if (reveals === null || reveals === undefined) return null;
  let used = 1;
  let picked = m[5];
  if (picked === undefined) {
    picked = new RegExp(`^you choose ${N} of (?:them|those cards)\\.$`, "i").exec(sentences[i + used] ?? "")?.[1];
    if (picked === undefined) return null;
    used += 1;
  }
  const picks = numberOf(picked);
  if (typeof picks !== "number") return null;
  if (!new RegExp(`^that player discards ${picks === 1 ? "that card" : "those cards"}\\.$`, "i").test(sentences[i + used] ?? "")) {
    return null;
  }
  used += 1;
  return {
    effect: {
      kind: "discard-chosen",
      target: ctx.target(m[1].toLowerCase() === "target opponent" ? "opponent" : "player"),
      reveals,
      ...(picks !== 1 ? { picks } : {}),
    },
    used,
  };
}

/**
 * A card name chosen as the spell resolves (rule 201.4), then used — a
 * `choose-card-name` around what follows, `CHOSEN_CARD_NAME` in it:
 *
 * - "Choose a nonland card name. Target player reveals their hand and
 *   discards all cards with that name." (Cabal Therapy)
 * - "Choose a card name, then target player mills a card. If a card with the
 *   chosen name was milled this way, you draw two cards. Otherwise, you draw
 *   a card." (Predict)
 *
 * `null` when the sentences aren't one of those.
 */
function nameChoiceAt(sentences, i, ctx) {
  const first = sentences[i] ?? "";
  const named = /^choose (?:a|an) ((?:[\w-]+, )*[\w-]+ )?card name\.$/i.exec(first);
  if (named !== null) {
    const filter = cardNameFilterOf(named[1] ?? "");
    const discard = /^(target player|target opponent) reveals their hand and discards all cards with that name\.$/i.exec(sentences[i + 1] ?? "");
    if (filter === null || discard === null) return null;
    const who = ctx.target(discard[1].toLowerCase() === "target opponent" ? "opponent" : "player");
    return {
      effect: {
        kind: "choose-card-name",
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
        then: { kind: "discard-hand", who, filter: { hasName: CHOSEN_CARD_NAME }, reveal: true },
      },
      used: 2,
    };
  }
  const mills = /^choose a card name, then (target player|target opponent) mills a card\.$/i.exec(first);
  if (mills === null) return null;
  const hit = sentenceRe(`if a card with the chosen name was milled this way, you draw ${N} cards?`).exec(sentences[i + 1] ?? "");
  const miss = sentenceRe(`otherwise, you draw ${N} cards?`).exec(sentences[i + 2] ?? "");
  const hitN = hit === null ? null : numberOf(hit[1]);
  const missN = miss === null ? null : numberOf(miss[1]);
  if (typeof hitN !== "number" || typeof missN !== "number") return null;
  const target = ctx.target(mills[1].toLowerCase() === "target opponent" ? "opponent" : "player");
  return {
    effect: {
      kind: "choose-card-name",
      aim: "opponent-library",
      then: {
        kind: "sequence",
        effects: [
          { kind: "mill", target, amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", filter: { hasName: CHOSEN_CARD_NAME } },
            then: { kind: "draw", amount: hitN },
            else: { kind: "draw", amount: missN },
          },
        ],
      },
    },
    used: 3,
  };
}

/** Each card type (rule 205.2a) a card in a library can have, in the order
 * the pool's "for each card type" cards list them (Vigean Intuition, Atraxa,
 * Grand Unifier). */
const EACH_CARD_TYPE = ["artifact", "battle", "creature", "enchantment", "instant", "kindred", "land", "planeswalker", "sorcery"];

/** "[Look at | Reveal] the top N cards of your library. [For each card type,
 * you may put a card of that type from among the revealed cards into your
 * hand | You may reveal a Cleric card, a Rogue card, …, and/or a Wizard card
 * from among them and put those cards into your hand]. Put the rest on the
 * bottom of your library in a random order." (Atraxa, Grand Unifier; Harper
 * Recruiter) — a `look-and-choose` whose chosen set fills one slot each
 * (`together.oneEach`): a slot per card type, or per type the list names.
 * Three sentences, one effect; `null` when they aren't that. */
function oneEachLookAt(sentences, i) {
  const look = sentenceRe(`(look at|reveal) the top ${N} cards of your library`).exec(sentences[i]);
  if (look === null) return null;
  const count = numberOf(look[2]);
  if (typeof count !== "number" || !/^put the rest on the bottom of your library in a random order\.$/i.test(sentences[i + 2] ?? "")) return null;
  const article = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");
  const choice = sentences[i + 1] ?? "";
  let slots;
  let text;
  let revealed = look[1].toLowerCase() === "reveal";
  if (/^for each card type among noncreature spells you've cast this turn, you may put a card of that type from among the (?:revealed cards|them) into your hand\.$/i.test(choice)) {
    // Hurkyl, Master Wizard: the slots are read as it resolves.
    return {
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count,
        reveal: revealed,
        min: 0,
        max: 9,
        together: { oneEachTypeAmong: { spellsYouCastThisTurn: { notTypes: ["creature"] } } },
        destination: "hand",
        leftover: "bottom-random",
      },
      used: 3,
    };
  }
  if (/^for each card type, you may put a card of that type from among the (?:revealed cards|them) into your hand\.$/i.test(choice)) {
    slots = EACH_CARD_TYPE.map((type) => ({ label: `${article(type)} ${type} card`, filter: { type } }));
    text = "a card of each card type";
  } else {
    const m = /^you may reveal ((?:an? [\w-]+ card, )+and\/or an? [\w-]+ card) from among them and put (?:those cards|them) into your hand\.$/i.exec(choice);
    if (m === null || revealed) return null;
    slots = [];
    for (const part of m[1].split(/, (?:and\/or )?/)) {
      const word = /^an? ([\w-]+) card$/i.exec(part)?.[1];
      const filter = word === undefined ? null : parseTypePhrase(word);
      if (filter === null || Object.keys(filter).length !== 1) return null;
      slots.push({ label: `${article(word)} ${word} card`, filter });
    }
    text = m[1];
    revealed = "chosen";
  }
  return {
    effect: {
      kind: "look-and-choose",
      zone: "library",
      count,
      reveal: revealed,
      min: 0,
      max: slots.length,
      together: { oneEach: slots, text },
      destination: "hand",
      leftover: "bottom-random",
    },
    used: 3,
  };
}

/** A search whose finds another player divides — `search-library`'s
 * `instead.chooser`: "Search your library for three cards and reveal them.
 * Target opponent chooses one. Put that card into your hand and the rest into
 * your graveyard. Then shuffle." (Intuition); "… up to four land cards with
 * different names and reveal them. An opponent chooses two of those cards. Put
 * the chosen cards into your graveyard and the rest into your hand. Then
 * shuffle." (Realms Uncharted), "… and the rest onto the battlefield tapped,
 * then shuffle." (Elemental Teachings); "… creature cards with different powers
 * and reveal them. An opponent chooses two of those cards. Shuffle the chosen
 * cards into your library and put the rest into your hand." (Threats
 * Undetected). */
function opponentDividesFindsAt(sentences, i, ctx) {
  const search = /^search your library for (up to )?(\w+) (?:(.+?) )?cards?( with different (?:names|powers))? and reveal them\.$/i.exec(sentences[i]);
  if (search === null) return null;
  const together = search[4] === undefined ? {} : { together: /powers/i.test(search[4]) ? { distinctPowers: true } : { distinctNames: true } };
  const pick = /^(target opponent|an opponent) chooses (one|two|three)(?: of those cards)?\.$/i.exec(sentences[i + 1] ?? "");
  if (pick === null) return null;
  const count = numberOf(search[2]);
  const picks = numberOf(pick[2]);
  if (typeof count !== "number") return null;
  const filter = search[3] === undefined ? {} : parseTypePhrase(search[3], { cards: true });
  if (filter === null) return null;
  const chooser = /^target/i.test(pick[1]) ? { target: ctx.target("opponent") } : "an-opponent";
  const shuffledIn = /^shuffle (?:that card|the chosen cards) into your library and put the rest into your hand\.$/i.test(sentences[i + 2] ?? "");
  if (shuffledIn) {
    return {
      effect: {
        kind: "search-library",
        filter,
        destination: "hand",
        min: search[1] === undefined ? count : 0,
        max: count,
        reveal: true,
        ...together,
        instead: { destination: "library", pick: picks === 1 ? "one" : { exactly: picks }, chooser },
      },
      used: 3,
    };
  }
  const put = /^put (?:that card|the chosen cards) (into your hand|into your graveyard) and the rest (into your hand|into your graveyard|onto the battlefield tapped)(, then shuffle)?\.$/i.exec(sentences[i + 2] ?? "");
  if (put === null) return null;
  const closed = put[3] !== undefined;
  if (!closed && !/^then shuffle\.$/i.test(sentences[i + 3] ?? "")) return null;
  const place = (phrase) => (/hand/.test(phrase) ? "hand" : /graveyard/.test(phrase) ? "graveyard" : "battlefield");
  const rest = place(put[2]);
  return {
    effect: {
      kind: "search-library",
      filter,
      destination: rest,
      ...(/tapped/.test(put[2]) ? { enterTapped: true } : {}),
      min: search[1] === undefined ? count : 0,
      max: count,
      reveal: true,
      ...together,
      instead: {
        destination: place(put[1]),
        pick: picks === 1 ? "one" : { exactly: picks },
        chooser,
      },
    },
    used: closed ? 3 : 4,
  };
}

/** An ability on the stack countered: "Counter target spell, activated ability,
 * or triggered ability." (Disallow), "Counter target activated or triggered
 * ability you don't control." (Nimble Obstructionist), "… from an artifact or
 * enchantment source. If a permanent's ability is countered this way, destroy
 * that permanent." (Green Slime), "… and destroy that artifact if it's on the
 * battlefield." (Ouphe Vandals); and all of them: "Counter all abilities your
 * opponents control." (Kadena's Silencer), "Exile all other spells and counter
 * all abilities." (Summary Dismissal). */
function counterAbilityAt(sentences, i, ctx) {
  const each = (fields, effect) => ({ kind: "for-each-on-stack", ...fields, effect });
  const counter = { kind: "counter", target: 0 };
  if (/^counter all abilities your opponents control\.$/i.test(sentences[i])) {
    return { effect: each({ abilities: true, whose: "opponent" }, counter), used: 1 };
  }
  if (/^exile all other spells and counter all abilities\.$/i.test(sentences[i])) {
    return {
      effect: {
        kind: "sequence",
        effects: [each({ spells: true }, { kind: "exile", target: 0 }), each({ abilities: true }, counter)],
      },
      used: 1,
    };
  }
  const m = /^counter target (spell, activated ability, or triggered ability|activated or triggered ability|activated ability|triggered ability)( you don't control)?(?: from an? ([a-z]+)(?: or ([a-z]+))? source)?( and destroy that (?:artifact|enchantment) if it's on the battlefield)?\.$/i.exec(sentences[i]);
  if (m === null) return null;
  const noun = m[1].toLowerCase();
  const sourceTypes = [m[3], m[4]].filter((t) => t !== undefined).map((t) => t.toLowerCase());
  if (noun.startsWith("spell") && (m[2] !== undefined || sourceTypes.length > 0)) return null;
  const spec = noun.startsWith("spell")
    ? { kind: "stack", spells: "any", abilities: true }
    : noun === "activated or triggered ability" && m[2] === undefined && sourceTypes.length === 0
      ? "activated-or-triggered-ability"
      : {
        kind: "ability",
        ...(m[2] !== undefined ? { whose: "opponent" } : {}),
        ...(noun === "activated ability" ? { abilityKind: "activated" } : noun === "triggered ability" ? { abilityKind: "triggered" } : {}),
        ...(sourceTypes.length > 0 ? { sourceTypes } : {}),
      };
  const thenThisWay = /^if a permanent's ability is countered this way, destroy that permanent\.$/i.test(sentences[i + 1] ?? "");
  const destroy = { kind: "destroy", target: 0 };
  const target = ctx.target(spec);
  return {
    effect: {
      kind: "counter",
      target,
      ...(m[5] !== undefined
        ? { thenSource: { effect: destroy, evenIfNotCountered: true } }
        : thenThisWay
          ? { thenSource: { effect: destroy } }
          : {}),
    },
    used: thenThisWay ? 2 : 1,
  };
}

/** An untargeted choice under a set rule: "Return any number of permanent
 * cards with different names from your graveyard to the battlefield." (Eerie
 * Ultimatum), and "Choose any number of creatures with different powers. Those
 * creatures gain double strike until end of turn." (Sigarda's Vanguard). */
function distinctSetAt(sentences, i) {
  const rule = (word) => (/powers/i.test(word) ? { distinctPowers: true } : { distinctNames: true });
  const back = /^return any number of (.+?) cards with different (names|powers) from your graveyard to the battlefield\.$/i.exec(sentences[i]);
  if (back !== null) {
    const filter = parseTypePhrase(back[1], { cards: true });
    if (filter === null) return null;
    return {
      effect: {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 99,
        filter,
        together: rule(back[2]),
        destination: "battlefield",
        leftover: "stay",
      },
      used: 1,
    };
  }
  const choose = /^choose any number of (creatures) with different (names|powers)\.$/i.exec(sentences[i]);
  const gain = /^those creatures gain (.+?) until end of turn\.$/i.exec(sentences[i + 1] ?? "");
  if (choose === null || gain === null) return null;
  const keyword = KEYWORDS[gain[1].toLowerCase()];
  if (keyword === undefined) return null;
  return {
    effect: {
      kind: "choose-permanents",
      filter: { type: "creature" },
      upTo: 99,
      together: rule(choose[2]),
      then: { kind: "grant-keyword", target: 0, keyword, duration: "end-of-turn" },
      prompt: `Choose any number of creatures with different ${choose[2].toLowerCase()} to gain ${gain[1].toLowerCase()}`,
    },
    used: 2,
  };
}

/** Another player chooses from a graveyard, then "put that card onto the
 * battlefield": "Target opponent chooses an artifact card in their graveyard.
 * Put that card onto the battlefield under your control." (Scrounge); "Each
 * opponent chooses a creature card in their graveyard. Put those cards onto the
 * battlefield under your control." (Dredge the Mire), the choices held until the
 * last has chosen. */
function opponentChoosesInGraveyardAt(sentences, i, ctx) {
  const m = /^(target opponent|each opponent) chooses an? (.+?) card in their graveyard\.$/i.exec(sentences[i]);
  if (m === null) return null;
  if (!/^put (?:that card|those cards) onto the battlefield under your control\.$/i.test(sentences[i + 1] ?? "")) return null;
  const filter = parseTypePhrase(m[2], { cards: true });
  if (filter === null) return null;
  const each = /^each/i.test(m[1]);
  return {
    effect: {
      kind: "for-each-player",
      who: each ? "each-opponent" : { target: ctx.target("opponent") },
      ...(each ? { choicesHeld: true } : {}),
      effect: {
        kind: "look-and-choose",
        player: "that-player",
        zone: "graveyard",
        min: 1,
        max: 1,
        filter,
        destination: "battlefield",
        under: "you",
        leftover: "stay",
      },
    },
    used: 2,
  };
}

/** "Look at the top five cards of your library. You may reveal up to two
 * creature and/or land cards from among them, then put the rest on the bottom
 * of your library in a random order. Put all land cards revealed this way onto
 * the battlefield tapped and put all creature cards revealed this way into your
 * hand." (Zimone's Experiment) — one `look-and-choose` with a `split`. */
/**
 * "Reveal cards from the top of your library until you reveal a nonland card",
 * and where the card found and the rest go: Treasure Hunt's one sentence,
 * "put that card into your hand and the rest on the bottom of your library in
 * any order", the count form (Fathom Trawl), and between the two the steps that
 * read the card found, with the target they read chosen first (Erratic
 * Explosion, Erratic Mutation, Goblin Machinist). Auspicious Starrix's exile.
 */
/**
 * "Its controller / That player may search their library for a basic land
 * card, put it onto the battlefield [tapped], then shuffle" after the one
 * sentence that targeted (Path to Exile, Assassin's Trophy, Arcum Dagsson):
 * theirs to decline, the target's controller as it last existed.
 */
function controllerMaySearch(sentence, ctx, parsed) {
  if (ctx.targets.length !== 1 || parsed.length === 0) return null;
  const m = /^(?:its controller|that player) may search their library for an? (.+?) card, put (?:it|that card) onto the battlefield( tapped)?, then shuffle\.$/i.exec(sentence);
  if (m === null) return null;
  const filter = parseTypePhrase(m[1], { cards: true });
  if (filter === null) return null;
  return {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    prompt: `Search your library for a ${m[1]} card?`,
    effect: { kind: "search-library", filter, destination: "battlefield", min: 0, max: 1, ...(m[2] ? { enterTapped: true } : {}) },
  };
}

/**
 * "Any opponent may have you put that card into your hand. If no player does,
 * you draw three cards" after a search that exiled it (Distant Memories), and
 * "Reveal the top card of your library. Any opponent may have you put that card
 * into your graveyard. If a player does, ~ deals damage to that player equal to
 * that card's mana value. Otherwise, put that card into your hand" (Sin Prodder):
 * an `unless` over the opponents, each asked in turn until one says yes.
 */
function anyOpponentMayAt(sentences, i, parsed) {
  const s = (n) => sentences[i + n] ?? "";
  const anyOpponent = (doing, text, otherwise) => ({
    kind: "unless",
    chooser: { anyOf: "each-opponent" },
    options: [{ doing, text }],
    otherwise,
  });
  if (
    /^any opponent may have you put that card into your hand\.$/i.test(s(0)) &&
    parsed.at(-1)?.kind === "search-library" &&
    parsed.at(-1).destination === "exile"
  ) {
    const draw = /^if no player does, you draw (\w+) cards?\.$/i.exec(s(1));
    const amount = draw === null ? undefined : numberOf(draw[1]);
    if (typeof amount !== "number") return null;
    return {
      effect: anyOpponent(
        { kind: "move-exiled-this-way", to: "hand" },
        "Have them put the exiled card into their hand",
        { kind: "draw", amount },
      ),
      used: 2,
    };
  }
  if (
    /^reveal the top card of your library\.$/i.test(s(0)) &&
    /^any opponent may have you put that card into your graveyard\.$/i.test(s(1)) &&
    /^if a player does, ~ deals damage to that player equal to that card's mana value\.$/i.test(s(2)) &&
    /^otherwise, put that card into your hand\.$/i.test(s(3))
  ) {
    return {
      effect: {
        kind: "reveal-top",
        then: anyOpponent(
          {
            kind: "sequence",
            effects: [
              { kind: "put-into-graveyard", target: 0 },
              { kind: "damage", amount: { manaValueOf: 0 }, who: "you" },
            ],
          },
          "Have them put the revealed card into their graveyard, and be dealt damage equal to its mana value",
          { kind: "return-to-hand", target: 0, from: "library" },
        ),
      },
      used: 4,
    };
  }
  return null;
}

function revealUntilAt(sentences, i, ctx) {
  const FROM_TOP = "reveal cards from the top of your library until you reveal";
  const REST = "on the bottom of your library in (any|a random) order";
  const restOf = (word) => (word.toLowerCase() === "any" ? "bottom-any-order" : "bottom-random");
  const whole = sentenceRe(`${FROM_TOP} an? ([\\w-]+) card, then put all cards revealed this way into your hand`).exec(sentences[i]);
  if (whole !== null) {
    const filter = parseTypePhrase(whole[1]);
    if (filter === null) return null;
    return { effect: { kind: "reveal-until", filter, rest: "hand" }, used: 1 };
  }
  if (
    /^exile cards from the top of your library until you exile x permanent cards, where x is the number of times ~ has mutated\.$/i.test(sentences[i]) &&
    /^put those permanent cards onto the battlefield\.$/i.test(sentences[i + 1] ?? "")
  ) {
    return {
      effect: {
        kind: "reveal-until-count",
        filter: { notTypes: ["instant", "sorcery"] },
        count: { timesMutated: "source" },
        exile: true,
        rest: "stay",
      },
      used: 2,
    };
  }
  const own = /^choose (any target|target creature)\.$/i.exec(sentences[i]);
  let j = own === null ? i : i + 1;
  const reveal = sentenceRe(`${FROM_TOP} ${N} ([\\w-]+) cards?`).exec(sentences[j] ?? "");
  if (reveal === null) return null;
  const count = numberOf(reveal[1]);
  const filter = parseTypePhrase(reveal[2]);
  if (typeof count !== "number" || filter === null) return null;
  j += 1;
  if (count > 1) {
    if (own !== null) return null;
    const puts = sentenceRe(
      `put the [\\w-]+ cards revealed this way into your hand, then put the rest of the revealed cards ${REST}`,
    ).exec(sentences[j] ?? "");
    if (puts === null) return null;
    return {
      effect: { kind: "reveal-until-count", filter, count, put: "hand", rest: restOf(puts[1]) },
      used: j + 1 - i,
    };
  }
  // A step reading the card found, its target a slot up from where it's chosen.
  const OF_CARD = "until end of turn, where x is that card's mana value";
  let then;
  const read = sentences[j] ?? "";
  const aimedAt = own === null ? null : own[1].toLowerCase() === "any target" ? "any-target" : "creature";
  if (aimedAt === "any-target" && /^~ deals damage equal to that card's mana value to that permanent or player\.$/i.test(read)) {
    then = (slot) => ({ kind: "damage", target: slot + 1, amount: { manaValueOf: 0 } });
  } else if (aimedAt === "creature" && sentenceRe(`that creature gets \\+x/-x ${OF_CARD}`).test(read)) {
    then = (slot) => ({
      kind: "modify-pt",
      target: slot + 1,
      power: { manaValueOf: 0 },
      toughness: { product: [{ manaValueOf: 0 }, -1] },
      duration: "end-of-turn",
    });
  } else if (aimedAt === null && sentenceRe(`~ gets \\+x/\\+0 ${OF_CARD}`).test(read)) {
    then = () => ({ kind: "modify-pt", target: "source", power: { manaValueOf: 0 }, toughness: 0, duration: "end-of-turn" });
  }
  if (then !== undefined) j += 1;
  else if (aimedAt !== null) return null;
  const close = sentences[j] ?? "";
  let puts = sentenceRe(`put that card (into your hand|onto the battlefield)( tapped)? and the rest ${REST}`).exec(close);
  let where = {};
  let rest;
  if (puts !== null) {
    where = {
      put: puts[1].toLowerCase() === "into your hand" ? "hand" : "battlefield",
      ...(puts[2] !== undefined ? { tapped: true } : {}),
    };
    if (where.tapped === true && where.put === "hand") return null;
    rest = puts[3];
  } else {
    puts = sentenceRe(`put the [\\w-]+ card into your hand and the rest ${REST}`).exec(close);
    if (puts !== null) {
      where = { put: "hand" };
      rest = puts[1];
    } else {
      puts = sentenceRe(`put (?:the revealed cards|all cards revealed this way) ${REST}`).exec(close);
      if (puts === null || then === undefined) return null;
      rest = puts[1];
    }
  }
  const effect = {
    kind: "reveal-until",
    filter,
    ...where,
    ...(then !== undefined ? { then: then(aimedAt === null ? 0 : ctx.target(aimedAt)) } : {}),
    ...(aimedAt !== null ? { thenKeepsTargets: true } : {}),
    rest: restOf(rest),
  };
  return { effect, used: j + 1 - i };
}

function splitLookAt(sentences, i) {
  const look = sentenceRe(`look at the top ${N} cards of your library`).exec(sentences[i]);
  if (look === null) return null;
  const count = numberOf(look[1]);
  const pick = sentenceRe(`you may reveal up to ${N} ([\\w-]+) and/or ([\\w-]+) cards from among them, then put the rest on the bottom of your library in a random order`).exec(sentences[i + 1] ?? "");
  if (typeof count !== "number" || pick === null) return null;
  const most = numberOf(pick[1]);
  const puts = /^put all ([\w-]+) cards revealed this way onto the battlefield tapped and put all ([\w-]+) cards revealed this way into your hand\.$/i.exec(sentences[i + 2] ?? "");
  if (typeof most !== "number" || puts === null) return null;
  const type = (word) => parseTypePhrase(word)?.type;
  const [first, second] = [type(pick[2]), type(pick[3])];
  const [toField, toHand] = [type(puts[1]), type(puts[2])];
  if (![first, second, toField, toHand].every((t) => typeof t === "string")) return null;
  return {
    effect: {
      kind: "look-and-choose",
      zone: "library",
      count,
      reveal: "chosen",
      min: 0,
      max: most,
      filter: { typesAnyOf: [first, second] },
      destination: "hand",
      split: [
        { label: `${toField} cards`, filter: { type: toField }, destination: "battlefield", enterTapped: true },
        { label: `${toHand} cards`, filter: { type: toHand }, destination: "hand" },
      ],
      leftover: "bottom-random",
    },
    used: 3,
  };
}

/** "Look at the top eight cards of your library. Put up to two creature cards
 * with total mana value 6 or less from among them onto the battlefield and the
 * rest on the bottom of your library in a random order." (Michelangelo's
 * Technique) — a `look-and-choose` under a total mana value cap. */
function totalManaValueLookAt(sentences, i) {
  const look = sentenceRe(`(look at|reveal) the top ${N} cards of your library`).exec(sentences[i]);
  if (look === null) return null;
  const count = numberOf(look[2]);
  const pick = sentenceRe(`put up to ${N} ([\\w-]+) cards with total mana value (\\d+) or less from among them onto the battlefield and the rest on the bottom of your library in a random order`).exec(sentences[i + 1] ?? "");
  if (typeof count !== "number" || pick === null) return null;
  const most = numberOf(pick[1]);
  const filter = parseTypePhrase(pick[2]);
  if (typeof most !== "number" || filter === null) return null;
  return {
    effect: {
      kind: "look-and-choose",
      zone: "library",
      count,
      ...(look[1].toLowerCase() === "reveal" ? { reveal: true } : {}),
      min: 0,
      max: most,
      filter,
      together: { totalManaValueAtMost: Number(pick[3]) },
      destination: "battlefield",
      leftover: "bottom-random",
    },
    used: 2,
  };
}

/**
 * A value chosen as the effect resolves, then read by the sentences after it
 * — `choose-value`:
 *
 * - "Choose a color. Target player reveals their hand and discards all cards
 *   of that color." (Persecute)
 * - "Choose a color. ~ deals X damage to each creature of the chosen color."
 *   (Sudden Demise)
 * - "Choose a card type. Target opponent reveals their hand. ~ deals 3 damage
 *   to that player for each card of the chosen type revealed this way."
 *   (Blood Oath)
 * - "Choose a counter on target permanent. Put an additional counter of that
 *   kind on that permanent." (Ichormoon Gauntlet)
 */
function chosenValueAt(sentences, i, ctx) {
  const s = (k) => sentences[i + k] ?? "";
  const wrap = (value, then, extra = {}) => ({ kind: "choose-value", value, ...extra, then });
  const who = (phrase) => ctx.target(phrase.toLowerCase() === "target opponent" ? "opponent" : "player");
  let m;
  // Terraformer, Elsewhere Flask: a word chosen as it resolves, replacing every
  // land type (rule 305.7).
  if (/^choose a basic land type\.$/i.test(s(0)) && /^each land you control becomes that type until end of turn\.$/i.test(s(1))) {
    return {
      effect: {
        kind: "choose-creature-type",
        options: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
        prompt: "Choose a basic land type",
        then: {
          kind: "for-each-permanent",
          filter: { type: "land", controlledBy: "you" },
          simultaneous: true,
          effect: { kind: "add-types", target: 0, setSubtypes: ["$chosen"], duration: "end-of-turn" },
        },
      },
      used: 2,
    };
  }
  if (/^choose a color\.$/i.test(s(0))) {
    m = /^(target player|target opponent) reveals their hand and discards all cards of (?:that|the chosen) color\.$/i.exec(s(1));
    if (m !== null) {
      return {
        effect: wrap("color", { kind: "discard-hand", who: who(m[1]), filter: { colors: [CHOSEN_COLOR] }, reveal: true }),
        used: 2,
      };
    }
    m = new RegExp(`^~ deals ${N} damage to each creature of (?:that|the chosen) color\\.$`, "i").exec(s(1));
    if (m !== null && numberOf(m[1]) !== undefined) {
      return {
        effect: wrap("color", {
          kind: "damage-all",
          filter: { type: "creature", colors: [CHOSEN_COLOR] },
          amount: numberOf(m[1]),
        }),
        used: 2,
      };
    }
    return null;
  }
  if (/^choose a card type\.$/i.test(s(0))) {
    const reveal = /^(target player|target opponent) reveals their hand\.$/i.exec(s(1));
    m = new RegExp(
      `^~ deals ${N} damage to that player for each card of the chosen type revealed this way\\.$`,
      "i",
    ).exec(s(2));
    const n = m === null ? undefined : numberOf(m[1]);
    if (reveal === null || typeof n !== "number") return null;
    const slot = who(reveal[1]);
    const count = { thisWay: "revealed", filter: { type: CHOSEN_CARD_TYPE } };
    return {
      effect: wrap("card-type", {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: slot },
          { kind: "damage", target: slot, amount: n === 1 ? count : { product: [n, count] } },
        ],
      }),
      used: 3,
    };
  }
  if (
    /^choose a counter on target permanent\.$/i.test(s(0)) &&
    /^put an additional counter of that kind on that permanent\.$/i.test(s(1))
  ) {
    const slot = ctx.target("permanent");
    return {
      effect: wrap(
        "counter-kind",
        { kind: "add-counter", target: slot, counter: CHOSEN_COUNTER, amount: 1 },
        { on: slot },
      ),
      used: 2,
    };
  }
  return null;
}

/**
 * Separating into two piles (rule 700.3) — `separate-into-piles`:
 *
 * - "Reveal the top five cards of your library. An opponent separates those
 *   cards into two piles. Put one pile into your hand and the other into your
 *   graveyard." (Fact or Fiction)
 * - "Reveal the top five cards of your library and separate them into two
 *   piles. An opponent chooses one of those piles. Put that pile into your
 *   hand and the other into your graveyard." (Steam Augury) — or "Look at …
 *   into a face-down pile and a face-up pile" (Curator of Destinies).
 * - "Target opponent looks at the top four cards of your library and
 *   separates them into a face-down pile and a face-up pile. Put one pile
 *   into your hand and the other into your graveyard." (Fortune's Favor)
 * - "Separate all permanents target player controls into two piles. That
 *   player sacrifices all permanents in the pile of their choice." (Liliana
 *   of the Veil), "… creatures … Destroy all creatures in the pile of that
 *   player's choice. They can't be regenerated." (Do or Die)
 * - "Separate all creature cards in your graveyard into two piles. Exile the
 *   pile of an opponent's choice and return the other to the battlefield."
 *   (Death or Glory)
 */
function pilesAt(sentences, i, ctx) {
  const s = (k) => sentences[i + k] ?? "";
  const handGraveyard = { chosen: "hand", rest: "graveyard" };
  const opponentChooses = (inner) => ({ kind: "choose-opponent", then: inner });
  // "Reveal the top N …. An opponent separates those cards into two piles.
  // Put one pile into your hand and the other into your graveyard."
  let m = new RegExp(`^reveal the top ${N} cards of your library\\.$`, "i").exec(s(0));
  if (
    m !== null &&
    /^an opponent separates those cards into two piles\.$/i.test(s(1)) &&
    /^put one pile into your hand and the other into your graveyard\.$/i.test(s(2))
  ) {
    const n = numberOf(m[1]);
    if (typeof n !== "number") return null;
    return {
      effect: opponentChooses({
        kind: "separate-into-piles",
        objects: { libraryTop: n, reveal: true },
        separator: "that-player",
        chooser: "you",
        ...handGraveyard,
      }),
      used: 3,
    };
  }
  // "Reveal (Look at) the top N … and separate them into two piles (a
  // face-down pile and a face-up pile). An opponent chooses one of those
  // piles. Put that pile into your hand and the other into your graveyard."
  m = new RegExp(
    `^(reveal|look at) the top ${N} cards of your library and separate them into (two piles|a face-down pile and a face-up pile)\\.$`,
    "i",
  ).exec(s(0));
  if (
    m !== null &&
    /^an opponent chooses one of those piles\.$/i.test(s(1)) &&
    /^put that pile into your hand and the other into your graveyard\.$/i.test(s(2))
  ) {
    const n = numberOf(m[2]);
    const reveal = m[1].toLowerCase() === "reveal";
    const faceDown = m[3].toLowerCase() !== "two piles";
    // A look with two plain piles, or a reveal with a face-down one: no
    // card says that, and the shape isn't read.
    if (typeof n !== "number" || reveal === faceDown) return null;
    return {
      effect: opponentChooses({
        kind: "separate-into-piles",
        objects: reveal ? { libraryTop: n, reveal: true } : { libraryTop: n },
        ...(faceDown ? { faceDown: true } : {}),
        chooser: "that-player",
        ...handGraveyard,
      }),
      used: 3,
    };
  }
  // "Target opponent looks at the top N … and separates them into a
  // face-down pile and a face-up pile. Put one pile into your hand and the
  // other into your graveyard."
  m = new RegExp(
    `^target opponent looks at the top ${N} cards of your library and separates them into a face-down pile and a face-up pile\\.$`,
    "i",
  ).exec(s(0));
  if (m !== null && /^put one pile into your hand and the other into your graveyard\.$/i.test(s(1))) {
    const n = numberOf(m[1]);
    if (typeof n !== "number") return null;
    const target = ctx.target("opponent");
    return {
      effect: {
        kind: "separate-into-piles",
        objects: { libraryTop: n },
        faceDown: true,
        separator: { target },
        chooser: "you",
        ...handGraveyard,
      },
      used: 2,
    };
  }
  // "Separate all permanents (creatures) target player controls into two
  // piles." and the chosen pile's fate.
  m = /^separate all (permanents|creatures) target player controls into two piles\.$/i.exec(s(0));
  if (m !== null) {
    const creatures = m[1].toLowerCase() === "creatures";
    const sacrifice = /^that player sacrifices all permanents in the pile of their choice\.$/i.test(s(1));
    const destroy =
      creatures &&
      /^destroy all creatures in the pile of that player's choice\.$/i.test(s(1)) &&
      /^they can't be regenerated\.$/i.test(s(2));
    if ((!sacrifice || creatures) && !destroy) return null;
    const target = ctx.target("player");
    return {
      effect: {
        kind: "separate-into-piles",
        objects: { permanents: creatures ? { type: "creature" } : {}, whose: { target } },
        chooser: { target },
        chosen: {
          effect: destroy
            ? { kind: "destroy", target: 0, cantBeRegenerated: true }
            : { kind: "sacrifice-target", target: 0, byItsController: true },
        },
      },
      used: destroy ? 3 : 2,
    };
  }
  // "Separate all creature cards in your graveyard into two piles. Exile the
  // pile of an opponent's choice and return the other to the battlefield."
  if (
    /^separate all creature cards in your graveyard into two piles\.$/i.test(s(0)) &&
    /^exile the pile of an opponent's choice and return the other to the battlefield\.$/i.test(s(1))
  ) {
    return {
      effect: opponentChooses({
        kind: "separate-into-piles",
        objects: { graveyard: { type: "creature" } },
        chooser: "that-player",
        chosen: "exile",
        rest: "battlefield",
      }),
      used: 2,
    };
  }
  return null;
}

function scaledBy(effect, amount) {
  if (effect.kind === "create-token" && effect.count === 1) return { ...effect, count: amount };
  if ((effect.kind === "add-counter" || effect.kind === "add-mana" || effect.kind === "gain-life") && effect.amount === 1) {
    return { ...effect, amount };
  }
  if (effect.kind === "modify-pt-all" && effect.power === 1 && effect.toughness === 1) {
    return { ...effect, power: amount, toughness: amount };
  }
  return null;
}

/** A template that half-matched: a missing slot, or a number that didn't parse. */
const containsUndefined = (v) =>
  v === undefined ||
  Number.isNaN(v) ||
  (typeof v === "object" && v !== null && Object.values(v).some(containsUndefined));

// ----------------------------------------------------------------- lines

/** The printed (not normalized) sentence, for `text` and TODO comments. */
const printed = (line) => stripReminder(line);

/**
 * A whole face. Returns plain definition data — `keywords`, `pairing`,
 * `targets`/`effect` (a spell's), `castModal`, `activated`, `triggered`,
 * `static`, `cycling`, `flashback`, `cantBeCountered` — plus `todo` (whole
 * lines no tier understood) and `complete` (nothing left to author).
 */
/** What "enter as a copy of [these words]" may copy (`CopyOnEnter`'s `filter`
 * and `from`), or null for a phrase this doesn't know. */
function copySourceOf(words) {
  let m;
  if ((m = /^any (creature|land) card in a graveyard( that was put there from the battlefield this turn)?$/.exec(words))) {
    const filter = { type: m[1], ...(m[2] !== undefined ? { putIntoGraveyardThisTurn: { from: ["battlefield"] } } : {}) };
    return { filter, from: "graveyards" };
  }
  if ((m = /^a (creature) card in exile with an? ([a-z]+) counter on it$/.exec(words))) {
    return { filter: { type: m[1], counters: { kind: m[2], compare: { op: "gte", n: 1 } } }, from: "exile" };
  }
  m = /^(?:any|an?) (artifact|creature|enchantment|land|planeswalker)(?: or (artifact|creature|enchantment|land|planeswalker))?( on the battlefield| you control| an opponent controls)$/.exec(words);
  if (m === null) return null;
  const controlled = m[3] === " you control" ? { controlledBy: "you" } : m[3] === " an opponent controls" ? { controlledBy: "opponent" } : {};
  return { filter: { ...(m[2] !== undefined ? { typesAnyOf: [m[1], m[2]] } : { type: m[1] }), ...controlled } };
}

/** The rest of a `CopyOnEnter` from its "except …" and "When you do, …"
 * words, or null when they say something this doesn't know. */
function copyOnEnterOf(what, exception, whenYouDo) {
  const source = copySourceOf(what);
  if (source === null) return null;
  const out = { ...source };
  if (exception !== undefined) {
    let m;
    if (exception === "it enters with a shield counter on it if you control that creature") {
      out.counters = [{ kind: "shield", amount: 1, ifYouControlCopied: true }];
    } else if (exception === "it's an artifact creature in addition to its other types, and its power and toughness are equal to ~'s power and toughness") {
      out.except = { addTypes: ["artifact", "creature"] };
      out.ownPt = true;
    } else if ((m = /^it's an? (\S+) in addition to its other types( and has ([a-z]+))?$/.exec(exception))) {
      const isSubtype = /^[A-Z]/.test(m[1]);
      out.except = {
        ...(isSubtype ? { addSubtypes: [m[1]] } : { addTypes: [m[1]] }),
        ...(m[3] !== undefined ? { keywords: [m[3]] } : {}),
      };
    } else {
      return null;
    }
  }
  if (whenYouDo !== undefined) {
    if (whenYouDo === "exile that card.") {
      out.whenYouDo = { effect: { kind: "exile", target: "trigger-object" }, text: `When you do, ${whenYouDo}` };
    } else if (whenYouDo === "tap the copied creature and it doesn't untap during its controller's untap step for as long as you control ~.") {
      out.whenYouDo = {
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "trigger-object" },
            { kind: "restrict", target: "trigger-object", restrictions: ["doesnt-untap"], duration: "while-you-control-source" },
          ],
        },
        text: `When you do, ${whenYouDo}`,
      };
    } else {
      return null;
    }
  }
  return out;
}

/** One form of a `BecomesOnEnter` — "a 2/2 artifact creature with flying", "a
 * 1/6 Wall artifact creature with defender" — or null. */
function enteringFormOf(words) {
  const m = /^an? (\d+)\/(\d+) (?:([A-Z][a-z]+) )?(artifact )?creature(?: with ([a-z]+))?$/.exec(words);
  if (m === null) return null;
  return {
    label: words.replace(/^an? /, ""),
    as: {
      basePt: [Number(m[1]), Number(m[2])],
      ...(m[4] !== undefined ? { addTypes: ["artifact", "creature"] } : {}),
      ...(m[3] !== undefined ? { addSubtypes: [m[3]] } : {}),
      ...(m[5] !== undefined ? { keywords: [m[5]] } : {}),
    },
  };
}

/** The opening-hand reveal's two word orders, and when each moment is. */
const OPENING_REVEAL_AT = {
  "the first upkeep": "next-upkeep",
  "your first upkeep": "your-next-upkeep",
  "your first main phase of the game": "your-next-main-phase",
};
const OPENING_REVEAL_WHEN = "the first upkeep|your first upkeep|your first main phase of the game";
const OPENING_REVEAL = new RegExp(
  `^You may reveal (?:~|this card) from your opening hand\\. If you do, at the beginning of (${OPENING_REVEAL_WHEN}), (.+)\\.$`,
);
const OPENING_REVEAL_AFTER = new RegExp(
  `^You may reveal (?:~|this card) from your opening hand\\. If you do, (.+) at the beginning of (${OPENING_REVEAL_WHEN})\\.$`,
);

/** `value` with every token-making effect marked as remembering its source —
 * what a card that goes on to say "tokens created with this" needs of them. */
function linkCreatedTokens(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(linkCreatedTokens);
  const walked = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, linkCreatedTokens(v)]));
  return value.kind === "create-token" || value.kind === "create-token-copy" ? { ...walked, linkedToSource: true } : walked;
}

export function parseFace(face, ctx = {}) {
  const out = parseFaceAsWritten(face, ctx);
  return /\btokens created with\b/i.test(face.oracle_text ?? "") ? linkCreatedTokens(out) : out;
}

function parseFaceAsWritten(face, ctx = {}) {
  const out = { keywords: [], activated: [], triggered: [], static: [], todo: [] };
  const lines = (face.oracle_text ?? "").split("\n").filter(Boolean);
  const isSpell = /\b(Instant|Sorcery)\b/.test(face.type_line ?? "");
  const tokenFor = ctx.tokenFor ?? (() => null);
  const spellTargets = [];

  // A station symbol ("8+ | Flying") opens a striation that runs to the next
  // one or the end of the text box (rule 721.2): every line after it is that
  // symbol's, not the card's own, and a person authors it as a
  // `stationBand`.
  let inStriation = false;
  // A level symbol ("LEVEL 2-6", "LEVEL 7+") opens a leveler's striation
  // (rule 711.2): its P/T line and keyword lines become one `levelStatic`;
  // any other line in it is a person's (an ability carrying `levelBand`).
  let level = null;
  const flushLevel = () => {
    if (level === null) return;
    // A band with a line no template reads is a person's, whole: its static
    // and that line's ability each carry the band.
    if (level.pt === null || level.unread) out.todo.push(...level.text.map(printed));
    else out.static.push(levelStatic(levelBand(level.min, level.max), level.pt[0], level.pt[1], level.text.join("\n"), level.keywords));
    level = null;
  };
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    let lv;
    if ((lv = /^LEVEL (\d+)(?:-(\d+)|\+)$/.exec(raw))) {
      flushLevel();
      level = { min: Number(lv[1]), max: lv[2] === undefined ? undefined : Number(lv[2]), pt: null, keywords: [], text: [raw] };
      continue;
    }
    if (level !== null) {
      level.text.push(raw);
      if (level.pt === null && (lv = /^(\d+)\/(\d+)$/.exec(raw))) { level.pt = [Number(lv[1]), Number(lv[2])]; continue; }
      const kws = printed(raw).split(/,\s*/).map((p) => KEYWORDS[p.toLowerCase()]);
      if (kws.every((k) => k !== undefined)) { level.keywords.push(...kws); continue; }
      level.unread = true;
      continue;
    }
    if (/^\d+\+ \| /.test(raw)) inStriation = true;
    // A Class's level bar ("{1}{U}{B}: Level 2", rule 716.2a): every line
    // after it is a class ability gated by that level (`atLevel`, with the
    // bar itself `classLevel`), which no template reads — a person's.
    if (/^(?:\{[^}]+\})+: Level \d+$/.test(raw)) inStriation = true;
    if (inStriation) { out.todo.push(printed(raw)); continue; }
    const whole = normalize(raw, face.name);
    // Kinship (Morningtide's ability word): the upkeep look and reveal is
    // `kinship()`; its last sentence, read on its own, is the effect — one
    // with no target (the revealed card is the `then`'s only one).
    const kin = KINSHIP.exec(whole);
    if (kin !== null) {
      const targets = [];
      const r = parseEffect(kin[1], { targets, tokenFor, onStack: ctx.onStack });
      const said = /If you do, (.+)\.$/.exec(raw)?.[1];
      if (r.effect !== null && targets.length === 0 && !containsTarget(r.effect) && said !== undefined) {
        out.triggered.push(kinship(r.effect, said));
      } else out.todo.push(printed(raw));
      continue;
    }
    // "Max speed — [ability]" (rule 702.178a): the ability, had only while
    // its controller's speed is 4 — the line read on its own, then given
    // the condition: a static on the card itself carrying it (`maxSpeed()`),
    // or, for an ability that works from the graveyard (702.178b), that
    // ability with the condition, "you" its owner.
    if (/^Max speed — /.test(whole)) {
      const maxed = maxSpeedLine(face, raw.replace(/^Max speed — /, ""), printed(raw), ctx);
      if (maxed === null) out.todo.push(printed(raw));
      else {
        out.activated.push(...maxed.activated);
        out.static.push(...maxed.static);
        Object.assign(out, maxed.card);
      }
      continue;
    }
    // "Equipped creature has '{1}, {T}, Sacrifice Ninja's Kunai: Ninja's
    // Kunai deals 3 damage to any target.'": a granted ability naming the
    // permanent that grants it (rule 201.5a — the `"granter"` reference).
    const namingGrant = granterNamingGrant(face, raw, ctx);
    if (namingGrant !== undefined) {
      if (namingGrant === null) out.todo.push(printed(raw));
      else out.static.push(namingGrant);
      continue;
    }
    // An ability word or flavor word ("Landfall —", "Crushing Teeth —") means
    // nothing, so it's dropped. A few labels written the same way do mean
    // something: Exhaust and Boast restrict an activated ability and become
    // its flags, and the rest aren't read at all.
    // (A villainous choice's dash isn't a label either: what comes before it
    // is the trigger or instruction.)
    // "Companion—[Condition]" (rule 702.139) is read, its condition as data.
    const companionLine = /^Companion — (.+)$/.exec(whole);
    const companion = companionLine === null ? null : companionCondition(companionLine[1]);
    if (companion !== null) {
      out.companion = companion;
      continue;
    }
    if (MEANINGFUL_LABEL.test(whole) || / villainous choice — /.test(whole)) { out.todo.push(printed(raw)); continue; }
    const label = /^(Exhaust|Boast|Forecast) — /.exec(whole)?.[1];
    const line = label ? whole.slice(label.length + 3) : whole.replace(/^[A-Z][\w' ,-]+ — (?=[A-Z~{+−-])/, "");
    if (label && !/^[^:]+: /.test(line)) { out.todo.push(printed(raw)); continue; }
    if (line === "") continue;
    let m;

    // Keywords, partner abilities, ward, and lines with no behaviour of their own.
    // A keyword line — "Flying, ward {2}" — each part a modeled keyword or a
    // plain ward; one part of anything else leaves the whole line to a person.
    // Recover's half-life cost has a comma of its own (Garza's Assassin).
    if (/^Recover—Pay half your life, rounded up\.?$/i.test(line)) { out.triggered.push(recover("half-life")); continue; }
    // Volcano Hellion's echo, read as the echo trigger resolves (the ruling).
    if (/^~ has echo \{X\}, where X is your life total\.$/.test(line)) {
      out.triggered.push(echo({ payGeneric: { lifeTotal: "you" }, text: "Pay {X}" }));
      continue;
    }
    // Imprint's exile is linked to this permanent (rule 607.2a — Mirror Golem).
    if (/^Imprint — When (?:~|this creature|this artifact) enters, you may exile target card from a graveyard\.$/i.test(whole)) {
      out.triggered.push({
        trigger: { on: "enters-battlefield", who: "self" },
        targets: [{ kind: "card-in-graveyard", whose: "any" }],
        effect: { kind: "may", prompt: "Exile target card from a graveyard?", effect: { kind: "exile", target: 0, linked: true } },
        resolve: null,
        text: printed(raw),
      });
      continue;
    }
    const parts = line.split(/,\s*|;\s*/);
    const wardOf = (p) => {
      const w = /^ward ((?:\{[0-9WUBRGC]+\})+)$/i.exec(p) ?? /^ward—pay (\d+) life\.?$/i.exec(p);
      if (w === null) return null;
      return /^\{/.test(w[1]) ? { mana: w[1] } : { payLife: Number(w[1]) };
    };
    const isProwess = (p) => p.toLowerCase() === "prowess";
    const known = (p) =>
      KEYWORDS[p.toLowerCase()] !== undefined || wardOf(p) !== null || isProwess(p) || protectionOf(p) !== null || keywordPart(p, face.name, face.type_line) !== null;
    // Two typecyclings on one line ("Mountaincycling {2}, forestcycling {2}")
    // are two abilities, and `cycling` holds one: such a line is a person's.
    const cardFields = parts.flatMap((p) => (KEYWORDS[p.toLowerCase()] === undefined ? Object.keys(keywordPart(p, face.name, face.type_line)?.card ?? {}) : []));
    const twice =
      cardFields.some((f, i) => cardFields.indexOf(f) !== i) ||
      // Morph on a land (Zoetic Cavern): a land is played, never cast, and the
      // engine offers no face-down cast for one.
      (cardFields.includes("morph") && /\bLand\b/.test(face.type_line ?? ""));
    // "When a Faerie is championed with this creature, …" (Mistbind
    // Clique) rides on the champion trigger itself — the helper's
    // `onChampioned` — so a card with one leaves its champion line to a person.
    const championedToo = parts.some((p) => /^champion /i.test(p)) && lines.some((l) => /is championed with/i.test(l));
    if (!twice && !championedToo && parts.every(known)) {
      for (const p of parts) {
        if (KEYWORDS[p.toLowerCase()] !== undefined) out.keywords.push(KEYWORDS[p.toLowerCase()]);
        else if (isProwess(p)) out.triggered.push(prowessAbility());
        else if (protectionOf(p) !== null) out.static.push(protectionOf(p));
        else if (wardOf(p) !== null) out.triggered.push(wardAbility(wardOf(p)));
        else {
          const k = keywordPart(p, face.name, face.type_line);
          out.keywords.push(...(k.keywords ?? []));
          out.triggered.push(...(k.triggered ?? []));
          out.activated.push(...(k.activated ?? []));
          out.static.push(...(k.static ?? []));
          Object.assign(out, k.card ?? {});
        }
      }
      continue;
    }
    if (line === "~ can be your commander.") { out.canBeCommander = true; continue; }
    // The card's own exception to the copy limit (100.2a, 903.5b; 101.1).
    if (line === "A deck can have any number of cards named ~.") { out.deckCopies = "any"; continue; }
    if ((m = /^A deck can have up to (\w+) cards named ~\.$/.exec(line)) && DECK_COPY_WORDS[m[1]] !== undefined) {
      out.deckCopies = DECK_COPY_WORDS[m[1]];
      continue;
    }
    // Rule 103.6a, the Leylines ("…with him on the battlefield": Quicksilver).
    if (/^If (?:~|this card) is in your opening hand, you may begin the game with (?:it|him|her|them) on the battlefield\.$/.test(line)) {
      out.beginsOnBattlefield = true;
      continue;
    }
    // Rule 103.5b, Serum Powder: at a time its holder would declare a mulligan.
    if (/^Any time you could mulligan and (?:~|this card) is in your hand, you may exile all the cards from your hand, then draw that many cards\.$/.test(line)) {
      out.mulliganHandAbility = "exile-hand-draw-that-many";
      continue;
    }
    // Rule 103.6b, the Chancellors, Providence: a delayed ability, either way
    // round ("…, at the beginning of the first upkeep, [effect]" and Sphinx of
    // Foresight's "[effect] at the beginning of your first upkeep"). One that
    // reads a target, or isn't read whole, is left to a person.
    if ((m = OPENING_REVEAL.exec(line) ?? OPENING_REVEAL_AFTER.exec(line))) {
      const [when, said] = OPENING_REVEAL.test(line) ? [m[1], m[2]] : [m[2], m[1]];
      const targets = [];
      const r = parseEffect(`${said.charAt(0).toUpperCase()}${said.slice(1)}.`, { targets, tokenFor, onStack: ctx.onStack });
      if (r.effect !== null && targets.length === 0) {
        out.openingHandReveal = { at: OPENING_REVEAL_AT[when], effect: r.effect, text: printed(raw) };
        continue;
      }
    }
    if (line === "Partner") { out.pairing = { kind: "partner" }; continue; }
    if ((m = /^Partner with (.+)$/.exec(line))) {
      out.pairing = { kind: "partner-with", name: m[1] };
      out.triggered.push(partnerWithAbility(m[1]));
      continue;
    }
    if ((m = /^Partner—(.+)$/.exec(line))) { out.pairing = { kind: "partner-group", group: m[1] }; continue; }
    if (line === "Friends forever") { out.pairing = { kind: "partner-group", group: "Friends forever" }; continue; }
    if (line === "Choose a Background") { out.pairing = { kind: "choose-a-background" }; continue; }
    if (line === "Doctor's companion") { out.pairing = { kind: "doctors-companion" }; continue; }
    if ((m = /^Ward ((?:\{[0-9WUBRGC]+\})+)$/.exec(line))) { out.triggered.push(wardAbility({ mana: m[1] })); continue; }
    if ((m = /^Ward—Pay (\d+) life\.$/.exec(line))) { out.triggered.push(wardAbility({ payLife: Number(m[1]) })); continue; }

    // Card-level lines.
    if ((m = /^Enchant (creature|land|artifact|enchantment|permanent|player|creature you control|creature or planeswalker)$/.exec(line))) {
      out.enchant = targetOf(`target ${m[1]}`);
      continue;
    }
    const equipReduced = /^Equip \{/.test(line) ? abilityReductionOf(line) : null;
    if ((m = /^Equip ((?:\{[^}]+\})+)\.?$/.exec(equipReduced?.rest ?? line))) {
      out.activated.push({
        ...(equipReduced !== null ? { costReduction: equipReduced.costReduction } : {}),
        cost: { mana: m[1], tap: false },
        targets: ["creature-you-control"],
        effect: { kind: "attach", target: 0 },
        resolve: null,
        text: printed(raw),
        sorcerySpeed: true,
      });
      continue;
    }
    // "Equip commander {3}" (rule 702.6a's "Equip [quality]"): a commander you
    // control, whoever owns it.
    if ((m = /^Equip commander ((?:\{[^}]+\})+)$/.exec(line))) {
      out.activated.push({
        cost: { mana: m[1], tap: false },
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", isCommander: true } }],
        effect: { kind: "attach", target: 0 },
        resolve: null,
        text: printed(raw),
        sorcerySpeed: true,
      });
      continue;
    }
    // Reconfigure [cost] (rule 702.151a): the `reconfigure` helper's two
    // abilities — attach to another creature you control, or unattach.
    if ((m = /^Reconfigure ((?:\{[^}]+\})+)$/.exec(line))) {
      const text = `Reconfigure ${m[1]}`;
      out.activated.push(
        {
          cost: { mana: m[1], tap: false },
          targets: [{ kind: "other", of: "creature-you-control" }],
          effect: { kind: "attach", target: 0 },
          resolve: null,
          text,
          sorcerySpeed: true,
          reconfigure: "attach",
        },
        {
          cost: { mana: m[1], tap: false },
          targets: [],
          condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
          effect: { kind: "unattach", target: "source" },
          resolve: null,
          text,
          sorcerySpeed: true,
          reconfigure: "unattach",
        },
      );
      continue;
    }
    // A Licid's ability (`licid: true`, `become-licid-aura`): it becomes an Aura on target
    // creature until its controller pays the cost to end the effect.
    if ((m = /^((?:\{[^}]+\})+), \{T\}: (?:~|This creature) loses this ability and becomes an Aura enchantment with enchant creature\. Attach it to target creature\. You may pay ((?:\{[^}]+\})+) to end this effect\.$/.exec(line))) {
      out.activated.push({
        cost: { mana: m[1], tap: true },
        targets: ["creature"],
        effect: { kind: "become-licid-aura", target: 0, endCost: m[2] },
        resolve: null,
        text: printed(raw),
        licid: true,
      });
      continue;
    }
    if ((m = /^Cycling ((?:\{[^}]+\})+)$/.exec(line))) { out.cycling = { cost: m[1] }; continue; }
    // A cycling cost that isn't mana (Street Wraith, Edge of Autumn).
    if ((m = /^Cycling—Pay (\d+) life\.?$/.exec(line))) {
      out.cycling = { cost: "", also: { payLife: Number(m[1]) }, costText: `Pay ${m[1]} life` };
      continue;
    }
    if ((m = /^Cycling—Sacrifice an? (.+?)\.?$/.exec(line))) {
      const filter = parseTypePhrase(m[1]);
      if (filter !== null && Object.keys(filter).length > 0) {
        out.cycling = { cost: "", also: { sacrifice: { filter } }, costText: `Sacrifice a${/^[aeiou]/i.test(m[1]) ? "n" : ""} ${m[1]}` };
        continue;
      }
    }
    if ((m = /^Flashback ((?:\{[^}]+\})+)$/.exec(line))) { out.flashback = { cost: m[1] }; continue; }
    // Jump-start (rule 702.133a): the graveyard cast for the card's own mana
    // cost, discarding a card.
    if (line === "Jump-start" && face.mana_cost) {
      out.flashback = { cost: face.mana_cost, discard: 1, keyword: "jump-start" };
      continue;
    }
    // Plot [cost] (rule 702.170a): a special action from the hand at sorcery speed.
    if ((m = /^Plot ((?:\{[^}]+\})+)$/.exec(line))) { out.plot = { cost: m[1] }; continue; }
    // Madness [cost] (rule 702.35a) — a mana cost only ("Madness—{2}{B}, Pay 8
    // life" isn't read).
    if ((m = /^Madness ((?:\{[^}]+\})+)$/.exec(line))) { out.madness = { cost: m[1] }; continue; }
    // A replacement working from the hand (Obstinate Baloth, Dodecapod).
    if ((m = /^If a spell or ability an opponent controls causes you to discard (?:~|this card), put it onto the battlefield( with two \+1\/\+1 counters on it)? instead of putting it into your graveyard\.$/.exec(line))) {
      out.discardedByOpponentEnters = m[1] ? { withCounters: { kind: "+1/+1", amount: 2 } } : {};
      continue;
    }
    // Miracle [cost] (rule 702.94a) — a mana cost.
    if ((m = /^Miracle ((?:\{[^}]+\})+)$/.exec(line))) { out.miracle = { cost: m[1] }; continue; }
    // Evoke [cost] (rule 702.74a), and the Incarnations' "Evoke—Exile a white
    // card from your hand." — an evoke whose cost is that exile.
    if ((m = /^Evoke ((?:\{[^}]+\})+)$/.exec(line))) { out.evoke = { cost: m[1] }; continue; }
    if ((m = /^Evoke—Exile (an? (?:white|blue|black|red|green) card) from your hand\.$/.exec(line))) {
      out.evoke = { cost: "", exileFromHand: pitchExile(m[1]) };
      continue;
    }
    // The pitch spells (rule 118.9): "[If it's not your turn, ]you may [pay 1
    // life and ]exile a blue card from your hand rather than pay this spell's
    // mana cost" — Force of Will, the MH1 Forces, Fury of the Horde.
    if ((m = /^(If it's not your turn, y|Y)ou may (?:pay (\d+) life and )?exile ((?:an?|two|three) (?:white|blue|black|red|green) cards?) from your hand rather than pay (?:this spell's|~'s) mana cost\.$/.exec(line))) {
      out.alternativeCost = {
        mana: "{0}",
        ...(m[2] !== undefined ? { payLife: Number(m[2]) } : {}),
        exileFromHand: pitchExile(m[3]),
        ...(m[1] !== "Y" ? { condition: { kind: "not", of: { kind: "your-turn" } } } : {}),
      };
      continue;
    }
    // The Shoals (rule 118.9, X announced — 107.3a): "you may exile a red
    // card with mana value X from your hand rather than pay this spell's mana
    // cost" — `exileFromHand.manaValueX`.
    if ((m = /^You may exile (an? (?:white|blue|black|red|green) card) with mana value X from your hand rather than pay (?:this spell's|~'s) mana cost\.$/.exec(line))) {
      out.alternativeCost = { mana: "{0}", exileFromHand: { ...pitchExile(m[1]), manaValueX: true } };
      continue;
    }
    // "You may discard a Plains card [and another card] rather than pay this
    // spell's mana cost" (Abolish, Foil): `alternativeCost.discard`.
    if ((m = /^You may discard (an? (Plains|Island|Swamp|Mountain|Forest) card( and another card)?) rather than pay (?:this spell's|~'s) mana cost\.$/.exec(line))) {
      out.alternativeCost = {
        mana: "{0}",
        discard: { filter: { subtype: m[2] }, ...(m[3] !== undefined ? { others: 1 } : {}), text: m[1] },
      };
      continue;
    }
    // "If you have no land cards in hand, you may reveal your hand rather
    // than pay this spell's mana cost" (Land Grant — rule 701.20a).
    if (/^If you have no land cards in hand, you may reveal your hand rather than pay (?:this spell's|~'s) mana cost\.$/.test(line)) {
      out.alternativeCost = {
        mana: "{0}",
        revealHand: true,
        condition: { kind: "hand-size", atMost: 0, filter: { type: "land" } },
      };
      continue;
    }
    // Paid in a life change, under a land you control (rule 118.9): "If you
    // control a Swamp, you may pay 4 life rather than pay this spell's mana
    // cost" (Snuff Out), "If you control a Forest, rather than pay this spell's
    // mana cost, you may have an opponent gain 3 life" (Invigorate), "… each
    // other player gain 6 life" (Reverent Silence).
    if ((m = /^If you control an? (Plains|Island|Swamp|Mountain|Forest), you may pay (\d+) life rather than pay (?:this spell's|~'s) mana cost\.$/.exec(line))) {
      out.alternativeCost = {
        mana: "{0}",
        payLife: Number(m[2]),
        condition: { kind: "controls", filter: { subtype: m[1] }, atLeast: 1 },
      };
      continue;
    }
    if ((m = /^If you control an? (Plains|Island|Swamp|Mountain|Forest), rather than pay (?:this spell's|~'s) mana cost, you may have (an opponent|each other player) gain (\d+) life\.$/.exec(line))) {
      out.alternativeCost = {
        mana: "{0}",
        othersGainLife: { amount: Number(m[3]), who: m[2] === "an opponent" ? "an-opponent" : "each-other-player" },
        condition: { kind: "controls", filter: { subtype: m[1] }, atLeast: 1 },
      };
      continue;
    }
    // A mana alternative cost (rule 118.9), the rest a parameter: "You may pay
    // {2}{R}{R} rather than pay this spell's mana cost" (Fervent Mastery), "and
    // exile a creature card from your graveyard" (Stalwart Valkyrie), "if there
    // are thirteen or more creatures on the battlefield" (Blasphemous Edict).
    // "As long as you've discarded a card this turn, you may pay {B/R} to cast
    // this spell" (Asmoranomardicadaistinaculdacar). What paying it changes
    // ("if the {2}{R}{R} cost was paid") is the card's own.
    if (!/Land/.test(face.type_line ?? "") && (m = /^You may pay ((?:\{[^}]+\})+)(?: and exile an? (creature|artifact|instant|sorcery|land|enchantment) card from your graveyard)? rather than pay (?:this spell's|~'s) mana cost(?: if there are (\w+) or more creatures on the battlefield)?\.$/.exec(line))) {
      const atLeast = m[3] === undefined ? 1 : { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10, thirteen: 13 }[m[3]];
      if (atLeast !== undefined) {
        out.alternativeCost = {
          mana: m[1],
          ...(m[2] !== undefined
            ? { also: { text: `exile a ${m[2]} card from your graveyard`.replace(/^exile a (?=[aeiou])/, "exile an "), exileFromGraveyard: { count: 1, filter: { type: m[2] } } } }
            : {}),
          ...(m[3] !== undefined ? { condition: { kind: "controls", filter: { type: "creature" }, atLeast, anyController: true } } : {}),
        };
        continue;
      }
    }
    if (!/Land/.test(face.type_line ?? "") && (m = /^As long as you've discarded a card this turn, you may pay ((?:\{[^}]+\})+) to cast (?:this spell|~)\.$/.exec(line))) {
      out.alternativeCost = { mana: m[1], condition: { kind: "turn-history", what: "discarded" } };
      continue;
    }
    // Mercadian Masques' free spells (rule 118.9): "you may sacrifice a
    // Mountain rather than pay this spell's mana cost" (Crash, Fireblast's
    // two), "you may return three Islands you control to their owner's hand
    // rather than pay" (Thwart, Gush), the Borderposts' "pay {1} and return a
    // basic land you control to its owner's hand". Lands of a basic type, or
    // basic lands, only.
    if ((m = /^You may (?:pay ((?:\{[^}]+\})+) and )?(sacrifice|return) (an?|two|three|four) (Plains|Island|Swamp|Mountain|Forest|basic land)s? (?:you control )?(?:to (?:its|their) owner's hand )?rather than pay (?:this spell's|~'s) mana cost\.$/.exec(line))) {
      const returning = m[2] === "return";
      const from = line.indexOf(`${m[2]} ${m[3]} `) + m[2].length + 1;
      const said = line.slice(from, returning ? line.indexOf(" to ", from) : line.indexOf(" rather"));
      if (returning === / to (?:its|their) owner's hand /.test(line)) {
        const count = { a: 1, an: 1, two: 2, three: 3, four: 4 }[m[3]];
        const filter = m[4] === "basic land" ? { type: "land", supertype: "basic" } : { type: "land", subtype: m[4] };
        out.alternativeCost = {
          mana: m[1] ?? "{0}",
          [returning ? "returnToHand" : "sacrifice"]: { filter, ...(count > 1 ? { count } : {}), text: said },
        };
        continue;
      }
    }
    // Mutate [cost] (rule 702.140a): the card's `mutate`.
    if ((m = /^Mutate ((?:\{[^}]+\})+)$/.exec(line))) { out.mutate = m[1]; continue; }
    // Bestow [cost] (rule 702.103a): the card's `bestow`.
    if ((m = /^Bestow ((?:\{[^}]+\})+)$/.exec(line))) { out.bestow = m[1]; continue; }
    // A spell's own cost changes (rule 601.2f) that the general read below
    // takes: a number, colored mana, per unit, under conditions, by target.
    if (!/\bLand\b/.test(face.type_line ?? "")) {
      const priced = selfCostLine(line);
      if (priced !== null) {
        Object.assign(out, priced);
        continue;
      }
    }
    // The Visions cycle's flashback, reduced "this way" by a commander.
    if (isSpell && (m = /^Flashback ((?:\{[^}]+\})+)\. ~ costs \{X\} less to cast this way, where X is the greatest mana value of a commander you own on the battlefield or in the command zone\.$/.exec(line))) {
      out.flashback = { cost: m[1] };
      out.selfCostReduction = {
        condition: { kind: "controls", filter: {}, atLeast: 0 },
        thisWay: "flashback",
        reduceGeneric: { commanderManaValue: "battlefield-or-command-zone" },
      };
      continue;
    }
    // Party (rule 700.8) and domain (207.2c) cost reductions: {1} less for
    // each, unconditionally — the always-true gate Leyline Binding uses.
    const perEach = {
      "~ costs {1} less to cast for each creature in your party.": { partySize: "you" },
      "~ costs {1} less to cast for each basic land type among lands you control.": { basicLandTypes: "you" },
      "~ costs {1} less to cast for each opponent you have.": { opponents: true },
    }[line];
    if (perEach !== undefined) {
      out.selfCostReduction = { condition: { kind: "controls", filter: {}, atLeast: 0 }, reduceGeneric: perEach };
      continue;
    }
    // Hollow One's "{2} less for each card you've cycled or discarded this
    // turn": cycling is discarding (rule 702.29a). Fast Forward's "{1} less for
    // each opponent you attacked this turn".
    if ((m = /^~ costs \{(\d+)\} less to cast for each card you've (?:cycled or )?discarded this turn\.$/.exec(line))) {
      out.selfCostReduction = {
        condition: { kind: "controls", filter: {}, atLeast: 0 },
        reduceGeneric: { turnHistory: "discarded", ...(m[1] === "1" ? {} : { times: Number(m[1]) }) },
      };
      continue;
    }
    if (line === "~ costs {1} less to cast for each opponent you attacked this turn.") {
      out.selfCostReduction = {
        condition: { kind: "controls", filter: {}, atLeast: 0 },
        reduceGeneric: { turnStat: "opponents-attacked", who: "you" },
      };
      continue;
    }
    // Devotion (rule 700.5): "~ costs {X} less to cast, where X is your
    // devotion to black" — Drag to the Underworld.
    if ((m = /^~ costs \{X\} less to cast, where X is your devotion to (white|blue|black|red|green)\.$/.exec(line))) {
      const color = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[m[1]];
      out.selfCostReduction = { condition: { kind: "controls", filter: {}, atLeast: 0 }, reduceGeneric: { devotionTo: [color] } };
      continue;
    }
    // "~ is also a Cleric, Rogue, Warrior, and Wizard" — a CDA adding
    // creature types in every zone (rule 604.3), the card's `alsoSubtypes`.
    if ((m = /^~ is also an? ((?:[A-Z][a-z]+, )*[A-Z][a-z]+,? and [A-Z][a-z]+|[A-Z][a-z]+)\.$/.exec(line)) && /\bCreature\b/.test(face.type_line ?? "")) {
      out.alsoSubtypes = m[1].split(/,? and |, /);
      continue;
    }
    if (isSpell && line === "Rebound") { out.rebound = true; continue; }
    // Cipher (rule 702.99a) — Gatecrash's encoded instants and sorceries.
    if (isSpell && line === "Cipher") { out.cipher = true; continue; }
    // Retrace (rule 702.81a): cast from the graveyard, discarding a land card.
    if (isSpell && line === "Retrace") { out.retrace = true; continue; }
    // Conspire (rule 702.78a): tap two creatures sharing its colour to copy it.
    if (isSpell && line === "Conspire") { out.conspire = true; continue; }
    // Day and night (rule 731.1): Midnight Hunt's non-daybound day/night cards.
    if (/^If it's neither day nor night, it becomes day as .+ enters\.$/.test(line)) { out.becomesDayAsEnters = true; continue; }
    // Sneak [cost] (rule 702.190): an alternative cost in the declare blockers step.
    if ((m = /^Sneak ((?:\{[^}]+\})+)$/.exec(line))) { out.sneak = { cost: m[1] }; continue; }
    // Web-slinging [cost] (rule 702.188a): an alternative cost returning a tapped creature you control.
    if ((m = /^Web-slinging ((?:\{[^}]+\})+)$/.exec(line))) { out.webSlinging = { cost: m[1] }; continue; }
    // Emerge [cost] (rule 702.119a): an alternative cost sacrificing a creature, its mana value off;
    // "Emerge from [quality]" (702.119b) sacrifices a permanent of that type instead.
    if ((m = /^Emerge (?:from (artifact|enchantment|land) )?((?:\{[^}]+\})+)$/.exec(line))) {
      out.emerge = { cost: m[2], ...(m[1] !== undefined ? { from: { type: m[1] } } : {}) };
      continue;
    }
    // "[Quality] offering" (rule 702.48a): an additional cost sacrificing a permanent of that quality, its
    // mana cost off, the spell then castable any time an instant could be.
    if (isSpell === false && (m = /^(\S+) offering$/.exec(line))) {
      const offering = parseTypePhrase(m[1].toLowerCase() === "artifact" ? "artifact" : m[1]);
      if (offering !== null && Object.keys(offering).length > 0) {
        out.kicker = { cost: "", keyword: "offering", flash: true, offering };
        continue;
      }
    }
    // Dash [cost] (rule 702.109a): an alternative cost — haste, and back to its owner's hand at the next end step.
    if ((m = /^Dash ((?:\{[^}]+\})+)$/.exec(line))) { out.dash = { cost: m[1] }; continue; }
    // Freerunning [mana cost] (rule 702.173a): an alternative cost once an Assassin or commander of yours dealt combat damage to a player this turn.
    if ((m = /^Freerunning ((?:\{[^}]+\})+)$/.exec(line))) { out.freerunning = { cost: m[1] }; continue; }
    // Impending N—[cost] (rule 702.176a): an alternative cost, and the card's own two abilities on the battlefield.
    if ((m = /^Impending (\d+)—((?:\{[^}]+\})+)$/.exec(line))) {
      out.impending = { count: Number(m[1]), cost: m[2] };
      out.static.push(IMPENDING_STATIC);
      out.triggered.push(IMPENDING_TRIGGER);
      continue;
    }
    // Splice onto Arcane / instant or sorcery [mana cost] (rule 702.47a): the
    // card's own effect and targets are what's spliced. A non-mana splice
    // cost ("Splice onto Arcane—Exile four cards …") is `splice.also`.
    if (isSpell && (m = /^Splice onto (Arcane|instant or sorcery) ((?:\{[^}]+\})+)$/.exec(line))) {
      out.splice = { onto: m[1] === "Arcane" ? "arcane" : "instant-or-sorcery", cost: m[2] };
      continue;
    }
    if (isSpell && (m = /^Splice onto (Arcane|instant or sorcery)—(.+?)\.$/.exec(line))) {
      const also = kickerAlso(m[2]);
      if (also !== null) {
        out.splice = { onto: m[1] === "Arcane" ? "arcane" : "instant-or-sorcery", cost: "", also };
        continue;
      }
    }
    // Teamwork N (rule 702.194): a kicker that taps creatures — what "cast using teamwork" changes is the card's own.
    if (isSpell && (m = /^Teamwork (\d+)$/.exec(line))) { out.kicker = { cost: "", keyword: "teamwork", teamwork: Number(m[1]) }; continue; }
    // Bargain (rule 702.166a): a kicker that sacrifices an artifact, enchantment or token — what
    // "if this spell was bargained" changes is the card's own (702.166c) — and its cost reduction.
    if (line === "Bargain") { out.kicker = { cost: "", keyword: "bargain" }; continue; }
    // Kicker [cost] (rule 702.33a). What kicking changes is read elsewhere: a
    // permanent's "When this enters, if it was kicked, …" (`self-kicked`); a
    // spell's "if this spell was kicked" stays a person's.
    if (!isSpell && (m = /^Kicker ((?:\{[^}]+\})+)$/.exec(line))) { out.kicker = { cost: m[1] }; continue; }
    // "Kicker [A] and/or [B]" (rule 702.33b): two kicker costs, each payable
    // once; "if it was kicked with its [A] kicker" reads `self-kicked`'s `with`.
    if (!isSpell && (m = /^Kicker ((?:\{[^}]+\})+) and\/or ((?:\{[^}]+\})+)$/.exec(line))) {
      out.kicker = { cost: m[1], second: m[2] };
      continue;
    }
    // Entwine [cost] (rule 702.42a): a kicker that chooses every mode — the
    // modal spell's `kickedModes`, set once its modes are read.
    if (isSpell && (m = /^Entwine ((?:\{[^}]+\})+)$/.exec(line))) { out.kicker = { cost: m[1], keyword: "entwine" }; continue; }
    // A kicker or entwine whose cost isn't mana (rule 702.33a, 702.42a):
    // "Kicker—Return a creature you control to its owner's hand" (Arctic
    // Merfolk), "Entwine—Sacrifice three lands" (Betrayal of Flesh) —
    // `kicker.also`. A spell's kicker stays a person's, as above.
    if ((m = /^(Kicker|Entwine)—(.+?)\.$/.exec(line)) && (m[1] === "Entwine") === isSpell) {
      const also = kickerAlso(m[2]);
      if (also !== null) {
        out.kicker = { cost: "", ...(m[1] === "Entwine" ? { keyword: "entwine" } : {}), also };
        continue;
      }
    }
    // Buyback [cost] (rule 702.27a): a kicker whose cast goes back to its
    // owner's hand as it resolves. A mana cost only.
    if (isSpell && (m = /^Buyback ((?:\{[^}]+\})+)$/.exec(line))) { out.kicker = { cost: m[1], keyword: "buyback" }; continue; }
    // Buyback with a non-mana cost (Slaughter's "Buyback—Pay 4 life",
    // Pegasus Stampede's "Buyback—Sacrifice a land"): `kicker.also`.
    if (isSpell && (m = /^Buyback—(.+)\.$/.exec(line))) {
      const also = buybackAlso(m[1]);
      if (also !== null) { out.kicker = { cost: "", keyword: "buyback", also }; continue; }
    }
    if (out.kicker?.keyword === "bargain" && (m = /^~ costs \{(\d+)\} less to cast if it's bargained\.$/.exec(line))) {
      out.kicker = { ...out.kicker, reduceGeneric: Number(m[1]) };
      continue;
    }
    // Replicate [cost] (rule 702.56a): a multikicker by another name; the
    // engine copies the spell once per payment as it's cast.
    if (isSpell && (m = /^Replicate ((?:\{[^}]+\})+)$/.exec(line))) {
      out.kicker = { cost: m[1], keyword: "replicate", multi: true };
      continue;
    }
    // Haunt (rule 702.55a): the `haunt()` / `hauntSpell()` helpers' trigger.
    // Its "when the creature it haunts dies" sentence stays a person's.
    if (line === "Haunt") {
      out.triggered.push({
        trigger: isSpell ? { on: "this-resolved-into-graveyard" } : { on: "dies", who: "self" },
        targets: ["creature"],
        effect: { kind: "exile", target: "trigger-object", haunting: 0 },
        resolve: null,
        text: isSpell
          ? "Haunt (When this spell card is put into a graveyard after resolving, exile it haunting target creature.)"
          : "Haunt (When this creature dies, exile it haunting target creature.)",
      });
      continue;
    }
    // Squad [cost] (rule 702.157a): a multikicker by another name, and its enters trigger (`squadTrigger`).
    // "Squad—Exile four cards from your graveyard", "Squad—{1}, Discard a
    // card": what isn't mana is `kicker.also`.
    const squadAlso = (m = /^Squad—(?:((?:\{[^}]+\})+), )?(.+?)\.$/.exec(line))
      ? (m[1] === undefined ? kickerAlso(m[2]) : buybackAlso(m[2]))
      : null;
    if (squadAlso !== null || (m = /^Squad ((?:\{[^}]+\})+)$/.exec(line))) {
      out.kicker =
        squadAlso !== null
          ? {
              cost: m[1] ?? "",
              multi: true,
              keyword: "squad",
              also: { ...squadAlso, text: m[1] === undefined ? m[2] : `${m[1]}, ${m[2]}` },
            }
          : { cost: m[1], multi: true, keyword: "squad" };
      out.triggered.push({
        trigger: { on: "enters-battlefield", who: "self" },
        condition: { kind: "self-kicked" },
        targets: [],
        effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
        resolve: null,
        text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
      });
      continue;
    }
    // Craft with [materials] [cost] (rule 702.167a): the `craft` helper's ability.
    if ((m = /^Craft with (.+?) ((?:\{[^}]+\})+)$/.exec(line))) {
      const materials = craftMaterials(m[1]);
      if (materials !== null) {
        out.activated.push({
          cost: { mana: m[2], tap: false, exileSelf: true, craft: materials },
          sorcerySpeed: true,
          targets: [],
          effect: { kind: "craft-return" },
          resolve: null,
          text: printed(raw),
        });
        continue;
      }
    }
    // Mayhem (rule 702.187): a cost to cast it from your graveyard the turn you discarded it, or none (a land's, played from there).
    if ((m = /^Mayhem((?: (?:\{[^}]+\})+)?)$/.exec(line))) { out.mayhem = m[1] ? { cost: m[1].trim() } : {}; continue; }
    if (line === "~ can't be countered.") { out.cantBeCountered = true; continue; }
    // The Mirage block's flash-and-sacrifice (`flashThenSacrifice`).
    if (/^You may cast (?:~|this spell) as though it had flash\. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step\.$/.test(line)) {
      out.flashThenSacrifice = true;
      continue;
    }
    // "You may cast this spell as though it had flash if you pay {2} more to
    // cast it" (Rout — rule 601.3c): the extra cost, not kicker.
    if ((m = /^You may cast ~ as though it had flash if you pay (\{\d+\}) more to cast it\.$/.exec(line))) {
      out.kicker = { cost: m[1], keyword: "flash", flash: true };
      continue;
    }
    // "Spell mastery — If there are two or more instant and/or sorcery cards
    // in your graveyard, this spell can't be countered" (Exquisite Firecraft).
    if (/^(?:Spell mastery — )?If there are two or more instant and\/or sorcery cards in your graveyard, ~ can't be countered\.$/.test(line)) {
      out.cantBeCountered = { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } };
      continue;
    }
    // A spell's own conditional flash (`flashIf`, rules 601.3b, 601.3d):
    // "You may cast this spell as though it had flash if you control a
    // Human / if it targets a commander", "As long as … / If …, you may cast
    // this spell as though it had flash", "This spell has flash as long as …"
    // — that last only when it says "this spell", or on an instant or
    // sorcery: "Colossal Rattlewurm has flash as long as …" is the
    // permanent's keyword too.
    {
      const clause =
        /^You may cast ~ as though it had flash if (.+)\.$/.exec(line)?.[1] ??
        /^(?:As long as|If) (.+), you may cast ~ as though it had flash\.$/.exec(line)?.[1] ??
        ((isSpell || /^This spell has flash/.test(printed(raw))) ? /^~ has flash as long as (.+)\.$/.exec(line)?.[1] : undefined);
      const flashIf = clause === undefined ? null : flashIfOf(clause);
      if (flashIf !== null) {
        out.flashIf = flashIf;
        continue;
      }
    }
    // "Choose a number between 0 and 5" (Liquid Fire): announced like an X.
    if (isSpell && (m = /^As an additional cost to cast ~, choose a number between (\d+) and (\d+)\.$/.exec(line))) {
      out.additionalCost = { chooseNumber: { min: Number(m[1]), max: Number(m[2]) } };
      continue;
    }
    if (isSpell && line === "As an additional cost to cast ~, sacrifice a creature.") {
      out.additionalCost = { sacrifice: { type: "creature", controlledBy: "you" } };
      continue;
    }
    // "Discard a card" (Thrill of Possibility), "discard two cards", "discard
    // X cards" (Sickening Dreams — an X the mana cost needn't have), "… at random".
    if (isSpell && (m = /^As an additional cost to cast ~, discard (a card|two cards|three cards|X cards)( at random)?\.$/.exec(line))) {
      const count = { "a card": 1, "two cards": 2, "three cards": 3, "X cards": "x" }[m[1]];
      out.additionalCost = { discard: count, ...(m[2] ? { discardAtRandom: true } : {}) };
      continue;
    }
    // "Discard a land card" (Magmatic Insight), "discard X land cards"
    // (Scorched Earth): `discardFilter`.
    if (isSpell && (m = /^As an additional cost to cast ~, discard (an?|X) (.+?) cards?\.$/.exec(line))) {
      const discardFilter = parseTypePhrase(m[2], { cards: true });
      if (discardFilter !== null && Object.keys(discardFilter).length > 0) {
        out.additionalCost = { discard: m[1] === "X" ? "x" : 1, discardFilter };
        continue;
      }
    }
    // "Tap two untapped creatures you control" (Shared Discovery), "return a
    // land you control to its owner's hand" (Deprive): `also`, as a keyword's
    // non-mana cost; "… or pay {1}" (Disruption Protocol) a branch of a choice.
    if (isSpell && (m = /^As an additional cost to cast ~, ((?:tap|return) .+?)(?: or pay ((?:\{[^}]+\})+))?\.$/.exec(line))) {
      const text = m[1].charAt(0).toUpperCase() + m[1].slice(1);
      const also = kickerAlso(text);
      if (also !== null) {
        out.additionalCost =
          m[2] === undefined ? { also } : { options: [{ text, also }, { text: `Pay ${m[2]}`, mana: m[2] }] };
        continue;
      }
    }
    // "Blight N or pay {M}" (rule 701.68a): a choice of whole costs.
    if (isSpell && (m = /^As an additional cost to cast ~, blight (\d+) or pay ((?:\{[^}]+\})+)\.$/.exec(line))) {
      out.additionalCost = { options: [{ text: `Blight ${m[1]}`, blight: Number(m[1]) }, { text: `Pay ${m[2]}`, mana: m[2] }] };
      continue;
    }
    // "You may blight N": a kicker by another name — what paying it changes
    // ("if this spell's additional cost was paid") is the card's own.
    if (isSpell && (m = /^As an additional cost to cast ~, you may blight (\d+)\.$/.exec(line))) {
      out.kicker = { cost: "", keyword: "blight", blight: Number(m[1]) };
      continue;
    }
    // "You may pay {2}{R}" (Undergrowth, rule 118.8), the same: what paying it
    // changes is the card's own.
    if (!/Land/.test(face.type_line ?? "") && (m = /^As an additional cost to cast ~, you may pay ((?:\{[^}]+\})+)\.$/.exec(line))) {
      out.kicker = { cost: m[1], keyword: "additional cost" };
      continue;
    }
    // "You may collect evidence N" (rule 701.59a), the same: "if evidence was collected" is the card's own.
    if ((m = /^As an additional cost to cast ~, you may collect evidence (\d+)\.$/.exec(line))) {
      out.kicker = { cost: "", keyword: "collect-evidence", collectEvidence: Number(m[1]) };
      continue;
    }
    // Behold (rule 701.4a) as a spell's cost — any spell's, a creature's too:
    // "behold an Elf or pay {2}" (a choice of whole costs), "you may behold a
    // Dragon" (a kicker by another name, whose "if a Dragon was beheld" is
    // read with the spell's text below), and "behold an Elemental and exile
    // it" (the Champions, the exiled card linked to the permanent, 607.2q).
    const castable = !/\bLand\b/.test(face.type_line ?? "");
    if (castable && (m = /^As an additional cost to cast ~, behold (.+) or pay ((?:\{[^}]+\})+)\.$/.exec(line)) && beholdOf(m[1]) !== null) {
      out.additionalCost = { options: [{ text: `Behold ${m[1]}`, behold: beholdOf(m[1]) }, { text: `Pay ${m[2]}`, mana: m[2] }] };
      continue;
    }
    if (castable && (m = /^As an additional cost to cast ~, you may behold (.+)\.$/.exec(line)) && beholdOf(m[1]) !== null) {
      out.kicker = { cost: "", keyword: "behold", behold: beholdOf(m[1]) };
      continue;
    }
    // Revealing a card from the hand as a spell's cost (rule 701.20a):
    // Lorwyn's "reveal a Kithkin card from your hand or pay {3}" (a choice of
    // whole costs), and Dragons of Tarkir's "you may reveal a Dragon card
    // from your hand" (a kicker by another name), whose "if you revealed a
    // Dragon card or controlled a Dragon as you cast this spell" adds
    // `orControls` and is read with the spell's text below.
    if (
      castable &&
      (m = /^As an additional cost to cast ~, reveal (.+) from your hand or pay ((?:\{[^}]+\})+)\.$/.exec(line)) &&
      handRevealOf(m[1])?.count === 1
    ) {
      const { filter } = handRevealOf(m[1]);
      out.additionalCost = {
        options: [
          { text: `Reveal ${m[1]}`, behold: { filter, text: m[1], fromHand: true } },
          { text: `Pay ${m[2]}`, mana: m[2] },
        ],
      };
      continue;
    }
    // A mandatory "reveal a creature card from your hand" (Induce Despair,
    // Calamity of the Titans): the card chosen as the cost is paid, read by
    // "the revealed card's …" below (`costRevealed`).
    if (
      castable &&
      (m = /^As an additional cost to cast ~, reveal (.+) from your hand\.$/.exec(line)) &&
      handRevealOf(m[1])?.count === 1
    ) {
      const { filter } = handRevealOf(m[1]);
      out.additionalCost = { behold: { filter, text: m[1], fromHand: true } };
      continue;
    }
    if (
      castable &&
      (m = /^As an additional cost to cast ~, you may reveal (.+) from your hand\.$/.exec(line)) &&
      handRevealOf(m[1])?.count === 1
    ) {
      const { filter } = handRevealOf(m[1]);
      out.kicker = { cost: "", keyword: "reveal", behold: { filter, text: m[1], fromHand: true } };
      const controlled = /if you revealed (?:a|an) .+? card or controlled (?:a|an) (\w+) as you cast/i.exec(face.oracle_text ?? "");
      const quality = controlled === null ? null : parseTypePhrase(controlled[1]);
      if (quality !== null) out.kicker.orControls = quality;
      continue;
    }
    // Waterbend (rule 701.67a) as a spell's cost: "waterbend {5}" / "{X}"
    // (an X the mana cost needn't have), and "you may waterbend {N}" (a
    // kicker by another name, whose "if this spell's additional cost was
    // paid" is read with the spell's text below).
    if (castable && (m = /^As an additional cost to cast ~, waterbend \{(\d+|X)\}\.$/.exec(line))) {
      out.additionalCost = { waterbend: m[1] === "X" ? "x" : Number(m[1]) };
      continue;
    }
    if (castable && (m = /^As an additional cost to cast ~, you may waterbend (\{\d+\})\.$/.exec(line))) {
      out.kicker = { cost: m[1], keyword: "waterbend" };
      continue;
    }
    // "Exile a creature you control" (Necrotic Fumes, Soul Exchange): named as a
    // sacrifice is, and exiled.
    if (castable && /^As an additional cost to cast ~, exile a creature you control\.$/.test(line)) {
      out.additionalCost = { sacrifice: { type: "creature" }, exilesSacrifice: true };
      continue;
    }
    // "Exile two creature cards from your graveyard" (the Skaabs): which,
    // chosen as the cost is paid (`additionalCost.exileFromGraveyard`).
    // "Exile X cards" (Harvest Pyre): X announced as it's cast.
    if (castable && (m = /^As an additional cost to cast ~, exile (X|a|an|one|two|three|four|five|six|seven|eight) (creature |instant or sorcery )?cards? from your graveyard\.$/.exec(line))) {
      const count = { X: "x", a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 }[m[1]];
      const filter = m[2] === "creature " ? { type: "creature" } : m[2] ? { typesAnyOf: ["instant", "sorcery"] } : undefined;
      out.additionalCost = { exileFromGraveyard: { count, ...(filter !== undefined ? { filter } : {}) } };
      continue;
    }
    // The card's own graveyard permission with costs of its own (rule
    // 601.2f — `castSelfFromGraveyard`): "You may cast ~ from your
    // graveyard by paying 3 life and discarding a card in addition to paying
    // its other costs" (Demonic Embrace), "… by paying {2}{W} rather than
    // paying its mana cost" (Raffine's Guidance), "… if you pay {1} more to
    // cast it for each other creature card in your graveyard" (Risen
    // Executioner), "… or from exile" (Squee, the Immortal).
    if (castable) {
      const self = selfGraveyardCast(line);
      if (self !== null) {
        out.castSelfFromGraveyard = self;
        continue;
      }
      // Its own permission over exile (Misthollow Griffin) or its library
      // during a search of it (Panglacial Wurm): rule 601.3.
      if (line === "You may cast ~ from exile.") {
        out.castSelfFromExile = true;
        continue;
      }
      if (line === "While you're searching your library, you may cast ~ from your library.") {
        out.castWhileSearchingLibrary = true;
        continue;
      }
    }
    // "This spell costs 3 life more to cast for each target" (Phyrexian
    // Purge — a cost increase, rule 601.2f): `additionalCost.payLifePerTarget`.
    if (castable && (m = /^~ costs (\d+) life more to cast for each target\.$/.exec(line))) {
      out.additionalCost = { payLifePerTarget: Number(m[1]) };
      continue;
    }
    // "This spell costs {3} less to cast if it targets a creature whose
    // controller has eight or more cards in their graveyard" (Lullmage's
    // Domination — `targetCostReduction`).
    if (
      castable &&
      (m = /^~ costs \{(\d+)\} less to cast if it targets an? (.+) whose controller has (\w+) or more cards in their graveyard\.$/.exec(line))
    ) {
      const filter = parseTypePhrase(m[2]);
      if (filter !== null && NUMBERS[m[3]] !== undefined) {
        out.targetCostReduction = {
          filter: { ...filter, controllerGraveyardAtLeast: NUMBERS[m[3]] },
          reduceGeneric: Number(m[1]),
        };
        continue;
      }
    }
    // A processor's additional cost (Processor Assault): which card, chosen
    // as the cost is paid (`additionalCost.putFromExile`).
    if (castable && /^As an additional cost to cast ~, put a card an opponent owns from exile into that player's graveyard\.$/.test(line)) {
      out.additionalCost = { putFromExile: 1 };
      continue;
    }
    if (castable && (m = /^As an additional cost to cast ~, behold (.+) and exile it\.$/.exec(line)) && beholdOf(m[1]) !== null) {
      out.additionalCost = { behold: { ...beholdOf(m[1]), exile: true } };
      continue;
    }
    // "Return the exiled card", linked to that exile (rule 607.2q).
    if (out.additionalCost?.behold?.exile === true && line === "When ~ leaves the battlefield, return the exiled card to its owner's hand.") {
      out.triggered.push({
        trigger: { on: "leaves-battlefield", who: "self" },
        targets: [],
        effect: { kind: "return-exiled-by-source", linked: "hand" },
        resolve: null,
        text: printed(raw),
      });
      continue;
    }
    // "Flashback—Sacrifice a creature." (rule 702.34a: any cost — Cabal
    // Therapy, Lava Dart, Dread Return): a sacrifice and no mana.
    if (isSpell && (m = /^Flashback—(Sacrifice .+)\.$/.exec(line))) {
      const also = kickerAlso(m[1]);
      if (also?.sacrifice !== undefined) {
        out.flashback = { cost: "", sacrifice: also.sacrifice };
        continue;
      }
    }
    // "Flashback—{R}{R}, Sacrifice X Mountains." (Firecat Blitz): X announced
    // for the cast though the flashback's mana has none.
    if (isSpell && (m = /^Flashback—((?:\{[^}]+\})+), Sacrifice X (.+)\.$/.exec(line))) {
      const filter = parseTypePhrase(m[2]);
      if (filter !== null && Object.keys(filter).length > 0) {
        out.flashback = { cost: m[1], sacrifice: { filter, count: "x" } };
        continue;
      }
    }
    // "Flashback—{1}{R}, Behold three Elementals." (rule 702.34a with 701.4a).
    if (isSpell && (m = /^Flashback—((?:\{[^}]+\})+), Behold (.+)\.$/.exec(line)) && beholdOf(m[2]) !== null) {
      out.flashback = { cost: m[1], behold: beholdOf(m[2]) };
      continue;
    }
    // "As ~ enters, choose a creature type." (rule 614.12) — and Titan of
    // Littjara's "~ is the chosen type in addition to its other types."
    if (line === "As ~ enters, choose a creature type.") {
      out.chooseCreatureTypeOnEnter = true;
      continue;
    }
    // "As this land enters, choose Elemental, Elf, … or Treefolk": a menu of
    // creature types, the chosen one read the same way (Eclipsed Realms).
    {
      const menu = /^As ~ enters, choose ((?:[A-Z][a-z]+, )+)or ([A-Z][a-z]+)\.$/.exec(line);
      if (menu !== null) {
        out.chooseCreatureTypeOnEnter = true;
        out.chooseCreatureTypeMenu = [...menu[1].split(", ").filter(Boolean), menu[2]];
        continue;
      }
    }
    // "Spend only mana produced by creatures to cast this spell" (Myr Superion).
    if (line === "Spend only mana produced by creatures to cast ~." || line === "Spend only mana produced by creatures to cast this spell.") {
      out.spendOnlyManaFrom = { type: "creature" };
      continue;
    }
    if (line === "Spend only mana produced by basic lands to cast ~." || line === "Spend only mana produced by basic lands to cast this spell.") {
      out.spendOnlyManaFrom = { type: "land", supertype: "basic" };
      continue;
    }
    // "You may have ~ enter as a copy of …" (rule 707.9): what it may copy, in
    // play or a card in a graveyard or exile, its exceptions and any "when you
    // do". An exception it can't say leaves the line to a person.
    if ((m = /^(If you attacked this turn, y|Y)ou may have ~ enter (tapped )?as a copy of (.+?)(?:, except (.+?))?\.(?: When you do, (.+\.))?$/.exec(line))) {
      const copy = copyOnEnterOf(m[3], m[4], m[5]);
      if (copy !== null) {
        out.copyOnEnter = {
          ...copy,
          // As printed: `line` writes the card's own name "~".
          ...(copy.whenYouDo !== undefined ? { whenYouDo: { ...copy.whenYouDo, text: raw.slice(raw.indexOf("When you do, ")) } } : {}),
          ...(m[1].startsWith("If") ? { condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 } } : {}),
          ...(m[2] !== undefined ? { tapped: true } : {}),
        };
        continue;
      }
    }
    // "As ~ enters, it becomes your choice of a 3/3 creature with flying, …"
    // (rule 614.1c; copiable, rule 707.2), or a coin's (Molten Sentry).
    if ((m = /^As ~ enters, it becomes your choice of (.+?),? or (.+?)(?: in addition to its other types)?\.$/.exec(line))) {
      const forms = [...m[1].split(", "), m[2]].map(enteringFormOf);
      if (forms.every((f) => f !== null)) {
        out.becomesOnEnter = { forms };
        continue;
      }
    }
    if ((m = /^As ~ enters, flip a coin\. If the coin comes up heads, ~ enters as (.+?)\. If it comes up tails, ~ enters as (.+?)\.$/.exec(line))) {
      const forms = [m[1], m[2]].map(enteringFormOf);
      if (forms.every((f) => f !== null)) {
        out.becomesOnEnter = { flip: true, forms };
        continue;
      }
    }
    // "As ~ enters, choose an opponent and a card name other than a basic
    // land card name." (Booby Trap): both choices, the name to guess a card
    // in that opponent's library.
    if ((m = /^As ~ enters, choose (a player|an opponent) and (?:a|an) (.*?)card name( other than a basic land card name)?\.$/.exec(line)) && cardNameFilterOf(m[2]) !== null) {
      out.choosePlayerOnEnter = m[1] === "a player" ? "player" : "opponent";
      const filter = { ...cardNameFilterOf(m[2]), ...(m[3] !== undefined ? { notBasicLand: true } : {}) };
      out.chooseCardNameOnEnter = { ...(Object.keys(filter).length > 0 ? { filter } : {}), aim: "opponent-library" };
      continue;
    }
    // "As ~ enters, choose a player / an opponent." (rule 614.1c) — the
    // chosen player its "the chosen player" lines read.
    // "As ~ enters, choose another creature you control." (rule 614.1c) —
    // the chosen permanent its "the chosen creature" lines read.
    if ((m = /^As ~ enters, choose ((?:another|an?) (.+?) you control)\.$/.exec(line)) && parseTypePhrase(m[2]) !== null) {
      out.choosePermanentOnEnter = {
        filter: { ...parseTypePhrase(m[2]), controlledBy: "you" },
        prompt: `Choose ${m[1]}`,
      };
      continue;
    }
    if ((m = /^As ~ enters, (secretly )?choose (a player|an opponent)\.$/.exec(line))) {
      out.choosePlayerOnEnter = m[2] === "a player" ? "player" : "opponent";
      if (m[1] !== undefined) out.secretChoiceOnEnter = true;
      continue;
    }
    // "As ~ enters, choose a nonland card name." (rule 201.4, asked as it
    // enters — 614.12), and the statics that read the name.
    if ((m = /^As ~ enters, choose (?:a|an|any) (.*?)card name\.$/.exec(line)) && cardNameFilterOf(m[1]) !== null) {
      const filter = cardNameFilterOf(m[1]);
      out.chooseCardNameOnEnter = Object.keys(filter).length > 0 ? { filter } : {};
      // A land's name is chosen to shut an opponent's land off (Alpine
      // Moon): their lands come first among the names offered.
      if (filter.types?.includes("land")) out.chooseCardNameOnEnter.aim = "opponent-permanents";
      continue;
    }
    if (out.chooseCardNameOnEnter !== undefined && (m = /^Activated abilities of sources with the chosen name can't be activated( unless they're mana abilities)?\.$/.exec(line))) {
      out.chooseCardNameOnEnter = { ...out.chooseCardNameOnEnter, aim: "opponent-permanents" };
      out.static.push({
        affects: { scope: "self" },
        prohibits: {
          who: "each-player",
          abilitiesOf: { chosenName: true },
          anyZone: true,
          ...(m[1] !== undefined ? { exceptManaAbilities: true } : {}),
        },
        text: printed(raw),
      });
      continue;
    }
    if (
      out.chooseCardNameOnEnter !== undefined &&
      (line === "Spells with the chosen name can't be cast." || line === "Your opponents can't cast spells with the chosen name.")
    ) {
      const who = line.startsWith("Your opponents") ? "opponents" : "each-player";
      out.static.push({ affects: { scope: "self" }, prohibits: { who, spells: { chosenName: true } }, text: printed(raw) });
      continue;
    }
    // A name lock on a reference (`sameNameWith`, rule 201.2a): "the exiled
    // card" (Ixalan's Binding, Exclusion Ritual — the card's own exile, rule
    // 607.2a) or "a nontoken permanent" (Cornered Market's spells and
    // nonbasic lands).
    if ((m = /^(Your opponents|Players) can't (cast spells|play nonbasic lands) with the same name as (the exiled card|a nontoken permanent)\.$/.exec(line))) {
      const who = m[1] === "Players" ? "each-player" : "opponents";
      const sameNameWith = m[3] === "the exiled card" ? "exiled-with-source" : { permanents: { token: false } };
      const prohibits =
        m[2] === "cast spells" ? { who, spells: { sameNameWith } } : { who, lands: { notSupertype: "basic", sameNameWith } };
      out.static.push({ affects: { scope: "self" }, prohibits, text: printed(raw) });
      continue;
    }
    // Land plays and casting by zone (rules 101.2, 305.2, 601.2a): "Players
    // can't play lands" (Territorial Dispute), "Your opponents can't cast
    // spells from anywhere other than their hands" (Drannith Magistrate),
    // "You can't play lands or cast spells from your hand" (Experimental
    // Frenzy).
    if ((m = /^(You|Your opponents|Players) can't play lands\.$/.exec(line))) {
      const who = m[1] === "You" ? "you" : m[1] === "Players" ? "each-player" : "opponents";
      out.static.push({ affects: { scope: "self" }, prohibits: { who, lands: {} }, text: printed(raw) });
      continue;
    }
    if ((m = /^(Your opponents|Players) can't cast spells from anywhere other than their hands\.$/.exec(line))) {
      const who = m[1] === "Players" ? "each-player" : "opponents";
      out.static.push({ affects: { scope: "self" }, prohibits: { who, spells: true, notFrom: ["hand"] }, text: printed(raw) });
      continue;
    }
    // A limit on the spells a player casts each turn (`prohibits.castLimit`):
    // "Each player can't cast more than one spell each turn" (Rule of Law),
    // "… one noncreature spell" (Deafening Silence), "… one non-Phyrexian
    // spell" (Phyrexian Censor), "You can't …" (Moderation), "Enchanted player
    // can't …" (Curse of Exhaustion), and Ethersworn Canonist's wording of it.
    if (
      (m = /^(Each player|You|Enchanted player) can't cast more than one (?:(.+?) )?spell each turn\.$/.exec(line)) ||
      (m = /^(Each player) who has cast an? (\S+) spell this turn can't cast additional \2 spells\.$/.exec(line))
    ) {
      const who = m[1] === "You" ? "you" : m[1] === "Each player" ? "each-player" : "enchanted-player";
      const phyrexian = /^non-([A-Z][a-z]+)$/.exec(m[2] ?? "");
      const spells = phyrexian !== null ? { notSubtypes: [phyrexian[1]] } : flashSpellsFilter(m[2]);
      if (spells !== null) {
        out.static.push({ affects: { scope: "self" }, prohibits: { who, spells, castLimit: 1 }, text: printed(raw) });
        continue;
      }
    }
    if (line === "You can't play lands or cast spells from your hand.") {
      out.static.push({
        affects: { scope: "self" },
        prohibits: { who: "you", spells: true, lands: {}, from: ["hand"] },
        text: printed(raw),
      });
      continue;
    }
    // Exiled Doomsayer: on morph and megamorph costs alone.
    if ((m = /^All morph costs cost \{(\d+)\} more\.$/.exec(line))) {
      out.static.push({ affects: { scope: "self" }, morphCostIncrease: Number(m[1]), text: printed(raw) });
      continue;
    }
    if (out.chooseCardNameOnEnter !== undefined && (m = /^Activated abilities of sources with the chosen name cost \{(\d+)\} more to activate( unless they're mana abilities)?\.$/.exec(line))) {
      out.chooseCardNameOnEnter = { ...out.chooseCardNameOnEnter, aim: "opponent-permanents" };
      out.static.push({
        affects: { scope: "self" },
        abilityCostModification: {
          applies: { chosenName: true },
          increaseGeneric: Number(m[1]),
          anyZone: true,
          ...(m[2] !== undefined ? { exceptManaAbilities: true } : {}),
        },
        text: printed(raw),
      });
      continue;
    }
    // Cost changes for one kind of ability (rule 602.2b): equip (702.6 —
    // Bureau Headmaster, Bladehold War-Whip's "of other Equipment", Dwarven
    // Mauler's "that target ~", Auriok Steelshaper's "Equip costs you pay"),
    // exhaust (702.177 — Boom Scholar), cycling (702.29 — Fluctuator),
    // loyalty (606 — Eidolon of Obstruction; Carth the Lion's added [+1],
    // 606.5).
    if (
      (m =
        /^(?:(Equip|Exhaust|Cycling) abilities (you activate|you activate of other Equipment|you activate that target ~|of other permanents you control)|(Equip) costs you pay) cost \{(\d+)\} (less|more)(?: to activate)?\.$/.exec(
          line,
        )) &&
      (m[3] === undefined || m[5] === "less")
    ) {
      const kind = (m[1] ?? m[3]).toLowerCase();
      const who = m[2] ?? "you activate";
      const n = Number(m[4]);
      out.static.push({
        affects: { scope: "self" },
        abilityCostModification: {
          applies:
            who === "of other permanents you control"
              ? { controlledBy: "you", isSource: false }
              : who === "you activate of other Equipment"
                ? { subtype: "Equipment", isSource: false }
                : {},
          abilityKind: kind,
          ...(who.startsWith("you activate") ? { byYou: true } : {}),
          ...(who === "you activate that target ~" ? { targetingSource: true } : {}),
          ...(m[5] === "less" ? { reduceGeneric: n } : { increaseGeneric: n }),
        },
        text: printed(raw),
      });
      continue;
    }
    if ((m = /^Loyalty abilities of planeswalkers (you|your opponents) control cost \{(\d+)\} (less|more) to activate\.$/.exec(line))) {
      const n = Number(m[2]);
      out.static.push({
        affects: { scope: "self" },
        abilityCostModification: {
          applies: { type: "planeswalker", controlledBy: m[1] === "you" ? "you" : "opponent" },
          abilityKind: "loyalty",
          ...(m[3] === "less" ? { reduceGeneric: n } : { increaseGeneric: n }),
        },
        text: printed(raw),
      });
      continue;
    }
    if ((m = /^Planeswalkers' loyalty abilities you activate cost an additional \[\+(\d+)\] to activate\.$/.exec(line))) {
      out.static.push({
        affects: { scope: "self" },
        abilityCostModification: { applies: { type: "planeswalker" }, abilityKind: "loyalty", byYou: true, increaseLoyalty: Number(m[1]) },
        text: printed(raw),
      });
      continue;
    }
    if (out.chooseCardNameOnEnter !== undefined && (m = /^Spells with the chosen name cost \{(\d+)\} (more|less) to cast\.$/.exec(line))) {
      const n = Number(m[1]);
      out.static.push({
        affects: { scope: "self" },
        costModification: { applies: { chosenName: true }, ...(m[2] === "more" ? { increaseGeneric: n } : { reduceGeneric: n }) },
        text: printed(raw),
      });
      continue;
    }
    // "As ~ enters, choose a color / a card type." (rule 614.12) — the word
    // its "of the chosen color" / "the chosen card type" lines read
    // (`chosenOnEnter`).
    if (line === "As ~ enters, choose a color.") {
      out.chooseOnEnter = ["W", "U", "B", "R", "G"];
      continue;
    }
    // "As ~ enters, choose a land type." Any that exists (rule 205.3i).
    if (line === "As ~ enters, choose a land type.") {
      out.chooseOnEnter = ["Cave", "Desert", "Forest", "Gate", "Island", "Lair", "Locus", "Mine", "Mountain", "Plains", "Planet", "Power-Plant", "Sphere", "Swamp", "Tower", "Town", "Urza's"];
      continue;
    }
    // "As ~ enters, choose a number between 1 and 10" (Talion): the words of a
    // short menu, read back as `{ chosenNumber }`.
    if ((m = /^As ~ enters, choose a number between (\d+) and (\d+)\.$/.exec(line))) {
      const low = Number(m[1]);
      out.chooseOnEnter = Array.from({ length: Number(m[2]) - low + 1 }, (_, i) => String(low + i));
      continue;
    }
    if (line === "As ~ enters, choose a color and an opponent.") {
      out.chooseOnEnter = ["W", "U", "B", "R", "G"];
      out.choosePlayerOnEnter = "opponent";
      continue;
    }
    if (line === "As ~ enters, choose a card type.") {
      // Rule 205.2a's, as `CARD_TYPE_CHOICES` lists them.
      out.chooseOnEnter = ["artifact", "battle", "creature", "enchantment", "instant", "kindred", "land", "planeswalker", "sorcery"];
      continue;
    }
    // "As Arachne enters, look at an opponent's hand, then choose a card type
    // other than creature": the same word, with the look first
    // (`chooseOnEnterLook`), and what it's for one static per type (Archon of
    // Valor's Reach's shape), each live only for the type chosen.
    if (line === "As ~ enters, look at an opponent's hand, then choose a card type other than creature.") {
      out.chooseOnEnter = ["artifact", "battle", "enchantment", "instant", "kindred", "land", "planeswalker", "sorcery"];
      out.chooseOnEnterLook = "opponent-hand";
      continue;
    }
    if (
      out.chooseOnEnter?.includes("artifact") === true &&
      (m = /^Spells of the chosen type cost \{(\d+)\} (more|less) to cast\.$/.exec(line))
    ) {
      const n = Number(m[1]);
      for (const type of out.chooseOnEnter) {
        out.static.push({
          affects: { scope: "self" },
          condition: { kind: "chosen-on-enter", value: type },
          costModification: { applies: { type }, ...(m[2] === "more" ? { increaseGeneric: n } : { reduceGeneric: n }) },
          text: printed(raw),
        });
      }
      continue;
    }
    // "You (and creatures you control) have protection from the chosen card
    // type" (Serra's Emissary): the player's half is `playerProtection`
    // (rule 702.16), the creatures' a `protection`.
    if (
      out.chooseOnEnter?.includes("creature") === true &&
      (m = /^You (and creatures you control )?have protection from the chosen card type\.$/.exec(line))
    ) {
      if (m[1] !== undefined) {
        out.static.push({ affects: { scope: "creatures-you-control" }, protection: { chosenCardType: true }, text: printed(raw) });
      }
      out.static.push({ affects: { scope: "self" }, playerProtection: { chosenCardType: true }, text: printed(raw) });
      continue;
    }
    // Protection from players (rule 702.16k): the player's own (Absolute
    // Virtue), the chosen player (True-Name Nemesis).
    if (/^You have protection from each of your opponents\.$/.test(line)) {
      out.static.push({ affects: { scope: "self" }, playerProtection: { fromPlayers: "opponents" }, text: printed(raw) });
      continue;
    }
    if (out.choosePlayerOnEnter !== undefined && line === "~ has protection from the chosen player.") {
      out.static.push({ affects: { scope: "self" }, protection: { fromPlayers: "chosen" }, text: printed(raw) });
      continue;
    }
    // "Commanders you control have protection from everything" (Vexilus
    // Praetor, rule 702.16j).
    if (/^(?:[^.—]+ — )?Commanders you control have protection from everything\.$/.test(line)) {
      out.static.push({ affects: { scope: "filter", filter: { isCommander: true, controlledBy: "you" } }, protection: { filter: {} }, text: printed(raw) });
      continue;
    }
    // "Human creatures you control have protection from creatures of the
    // chosen type" (Riders of Gavony): read off this permanent.
    if (out.chooseCreatureTypeOnEnter === true && (m = /^([A-Z]\w+) creatures you control have protection from creatures of the chosen type\.$/.exec(line))) {
      out.static.push({ affects: { scope: "creatures-you-control", subtype: m[1] }, protection: { filter: { type: "creature", ofChosenType: true } }, text: printed(raw) });
      continue;
    }
    // Imprint's "the exiled card's card types" (Mirror Golem).
    if (line === "~ has protection from each of the exiled card's card types.") {
      out.static.push({ affects: { scope: "self" }, protection: { exiledCardTypes: true }, text: printed(raw) });
      continue;
    }
    // "This effect doesn't remove this Aura" (rule 702.16n): Tattoo Ward.
    if ((m = /^Enchanted creature (?:gets ([+-]\d+)\/([+-]\d+) and )?has protection from (artifacts|enchantments|creatures)\. This effect doesn't remove (?:this Aura|~)\.$/.exec(line))) {
      out.static.push({
        affects: { scope: "attached" },
        ...(m[1] !== undefined ? { grantPt: [Number(m[1]), Number(m[2])] } : {}),
        protection: { types: [m[3].slice(0, -1)], doesntRemoveSource: true },
        text: printed(raw),
      });
      continue;
    }
    // "You have protection from the chosen card name" (Runed Halo).
    if (out.chooseCardNameOnEnter !== undefined && line.startsWith("You have protection from the chosen card name.")) {
      out.chooseCardNameOnEnter = { ...out.chooseCardNameOnEnter, aim: "opponent-permanents" };
      out.static.push({ affects: { scope: "self" }, playerProtection: { filter: { chosenName: true } }, text: printed(raw) });
      continue;
    }
    // Lifecraft Engine: "Vehicle creatures you control are the chosen creature
    // type in addition to their other types."
    if (out.chooseCreatureTypeOnEnter === true && (m = /^([A-Z]\w+) creatures you control are the chosen creature type in addition to their other types\.$/.exec(line))) {
      out.static.push({
        affects: { scope: "filter", filter: { type: "creature", subtype: m[1], controlledBy: "you" } },
        addsChosenCreatureType: true,
        text: printed(raw),
      });
      continue;
    }
    if (out.chooseCreatureTypeOnEnter === true && (m = /^Each creature you control of the chosen type other than ~ gets \+(\d+)\/\+(\d+)\.$/.exec(line))) {
      out.static.push({
        affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", ofChosenType: true }, excludeSelf: true },
        grantPt: [Number(m[1]), Number(m[2])],
        text: printed(raw),
      });
      continue;
    }
    if (out.chooseCreatureTypeOnEnter === true && line === "~ is the chosen type in addition to its other types.") {
      out.static.push({ affects: { scope: "self" }, addsChosenCreatureType: true, text: printed(raw) });
      continue;
    }
    // A behold land: "As ~ enters, you may behold a Jace. If you don't, ~
    // enters tapped." — asked as it enters (rule 614.12).
    if ((m = /^As ~ enters, you may behold (.+)\. If you don't, ~ enters tapped\.$/.exec(line)) && beholdOf(m[1]) !== null) {
      out.static.push({
        affects: { scope: "self" },
        replacement: { event: "enters-battlefield", tappedUnlessBehold: beholdOf(m[1]) },
        text: printed(raw),
      });
      continue;
    }

    // Static lines.
    const tokenReplacement = tokenReplacementOf(line, printed(raw), tokenFor);
    if (tokenReplacement !== null) { out.static.push(tokenReplacement); continue; }
    const st = parseStatic(line, printed(raw));
    if (st !== null) { out.static.push(st); continue; }

    // Loyalty abilities.
    if ((m = /^([+−-]?)(\d+|X): (.+)$/.exec(line)) && face.loyalty !== undefined) {
      const minusX = m[2] === "X" && (m[1] === "−" || m[1] === "-");
      const n = m[2] === "X" ? null : Number(m[2]) * (m[1] === "" || m[1] === "+" ? 1 : -1);
      // "−X" is `"-x"` (its X announced as it's activated, rule 107.3a). The
      // engine has no "+X" cost; 0 keeps the skeleton compiling, and the TODO
      // keeps it out of review/.
      const ability = { loyaltyCost: minusX ? "-x" : n ?? 0, cost: { mana: null, tap: false }, targets: [], effect: null, resolve: null, text: printed(raw) };
      if (n === null && !minusX) { ability.__todo = ["a +X loyalty cost"]; }
      fillEffect(ability, m[3], { tokenFor, onStack: true }, lines, i);
      out.activated.push(ability);
      continue;
    }

    // Activated abilities: "cost: effect".
    const colon = line.indexOf(": ");
    if (colon > 0 && !/^(When|Whenever|At )/.test(line)) {
      let costText = line.slice(0, colon);
      // Forecast (rule 702.57): "[cost], Reveal ~ from your hand: [effect]" —
      // an ability of the card in its owner's hand, which it stays in,
      // activatable only in their upkeep and once each turn (`forecast()`).
      if (label === "Forecast") {
        if (!/, Reveal ~ from your hand$|^Reveal ~ from your hand$/.test(costText)) { out.todo.push(printed(raw)); continue; }
        costText = costText.replace(/,? ?Reveal ~ from your hand$/, "");
      }
      const parsedCost = costText === "" ? { cost: { mana: null, tap: false }, extra: {} } : parseCost(costText);
      if (parsedCost === null) { out.todo.push(printed(raw)); continue; }
      const ability = { cost: parsedCost.cost, targets: [], effect: null, resolve: null, text: printed(raw), ...parsedCost.extra };
      if (label === "Exhaust") ability.exhaust = true;
      if (label === "Boast") ability.boast = true;
      if (label === "Forecast") {
        Object.assign(ability, {
          zone: "hand",
          staysInZone: true,
          oncePerTurn: true,
          condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
        });
      }
      let rest = line.slice(colon + 2);
      // "This ability costs {1} less to activate for each other artifact you
      // control" (Tamiyo's Logbook): the ability's `costReduction`.
      rest = rest.replace(/ This ability costs \{1\} less to activate for each ((?:other )?.+? you control)\.$/, (whole, each) => {
        const amount = costEachAmount(each);
        if (amount === null) return whole;
        ability.costReduction = { reduceGeneric: amount };
        return "";
      });
      const restrictions = [];
      rest = rest.replace(/ Activate only (as a sorcery|once each turn|during your turn)\.$/, (_x, r) => {
        restrictions.push(r);
        return "";
      });
      rest = rest.replace(/ Activate only (as a sorcery|once each turn|during your turn)\.$/, (_x, r) => {
        restrictions.push(r);
        return "";
      });
      // "Activate only once" (Stalking Leonin): the limit an Exhaust label's
      // ability has, on an ability that isn't one.
      rest = rest.replace(/ Activate only once\.$/, () => {
        ability.onlyOnce = true;
        return "";
      });
      if (restrictions.includes("as a sorcery")) ability.sorcerySpeed = true;
      if (restrictions.includes("once each turn")) ability.oncePerTurn = true;
      if (restrictions.includes("during your turn")) ability.condition = { kind: "your-turn" };
      // "Tap enchanted creature: … Activate only if enchanted creature is
      // [white and] untapped [and only once each turn]" (Krovikan Plague,
      // Nature's Chosen): being untapped is what the cost asks anyway (rule
      // 118.3), so it's said only of a cost that taps the host.
      if (ability.cost?.tapOthers?.filter?.hostOfSource === true) {
        rest = rest.replace(
          / Activate only if enchanted (?:creature|land|permanent) is (?:(white|blue|black|red|green) and )?untapped( and only once each turn)?\.$/,
          (_x, color, once) => {
            if (color !== undefined) {
              const letter = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[color];
              ability.condition = { kind: "source", filter: { attachedTo: { colors: [letter] } } };
            }
            if (once !== undefined) ability.oncePerTurn = true;
            return "";
          },
        );
      }
      // "Activate only during your turn and only once each turn" (Nature's Chosen).
      rest = rest.replace(/ Activate only during your turn and only once each turn\.$/, () => {
        ability.condition = { kind: "your-turn" };
        ability.oncePerTurn = true;
        return "";
      });
      // Rocket Launcher: rule 302.6's test, of a permanent of any type.
      rest = rest.replace(/ Activate only if you've controlled ~ continuously since the beginning of your most recent turn\.$/, () => {
        ability.condition = { kind: "source", filter: { controlledContinuously: true } };
        return "";
      });
      // Norritt's, Nettling Imp's and Talas Researcher's "before attackers
      // are declared": the first combat's, so a main phase after it is too late.
      rest = rest.replace(/ Activate only (during an opponent's turn, |during your turn, )?before attackers are declared\.$/, (whole, turn) => {
        const before = {
          kind: "any",
          of: [
            { kind: "turn-structure", steps: ["upkeep", "draw"] },
            { kind: "turn-structure", mainPhase: 1 },
            { kind: "turn-structure", steps: ["begin-combat"], combatPhase: 1 },
          ],
        };
        ability.condition =
          turn === undefined
            ? before
            : { kind: "all", of: [/your/.test(turn) ? { kind: "your-turn" } : { kind: "not", of: { kind: "your-turn" } }, before] };
        return "";
      });
      rest = rest.replace(/ Activate only during your upkeep\.$/, () => {
        ability.condition = { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] };
        return "";
      });
      {
        const reduced = abilityReductionOf(rest);
        if (reduced !== null) {
          rest = reduced.rest;
          ability.costReduction = reduced.costReduction;
        }
      }
      // "Activate no more than twice each turn" (Pit Imp — rule 602.5b), and
      // "no more times each turn than the number of snow Swamps you control"
      // (Withering Wisps): `timesEachTurn`, a number or a count.
      rest = rest.replace(/ Activate no more than (twice|(\w+) times) each turn\.$/, (whole, _w, n) => {
        const times = n === undefined ? 2 : numberOf(n);
        if (typeof times !== "number") return whole;
        ability.timesEachTurn = times;
        return "";
      });
      rest = rest.replace(/ Activate no more times each turn than the number of (snow )?(.+?) you control\.$/, (whole, snow, phrase) => {
        const filter = parseTypePhrase(phrase);
        if (filter === null || Object.keys(filter).length === 0) return whole;
        ability.timesEachTurn = { countOf: { ...filter, ...(snow !== undefined ? { supertype: "snow" } : {}), controlledBy: "you" } };
        return "";
      });
      // "Any player may activate this ability [but only as a sorcery]" (rule
      // 602.2 — Prophecy's Glittering Lion, Excavation).
      rest = rest.replace(/ Any player may activate this ability( but only as a sorcery)?\.$/, (_x, sorcery) => {
        ability.anyPlayer = true;
        if (sorcery !== undefined) ability.sorcerySpeed = true;
        return "";
      });
      // "Only your opponents may activate this ability and only as a sorcery"
      // (Detention Vortex, Oft-Nabbed Goat).
      rest = rest.replace(/ Only your opponents may activate this ability( and only as a sorcery)?\.$/, (_x, sorcery) => {
        ability.anyPlayer = true;
        ability.onlyOpponents = true;
        if (sorcery !== undefined) ability.sorcerySpeed = true;
        return "";
      });
      // Coven's "Activate only if you control three or more creatures with
      // different powers" (Midnight Hunt).
      rest = rest.replace(/ Activate only if you control three or more creatures with different powers\.$/, () => {
        ability.condition = { kind: "coven" };
        return "";
      });
      // Ascend's "Activate only if you have the city's blessing" (Orazca Relic).
      rest = rest.replace(/ Activate only if you have the city's blessing\.$/, () => {
        ability.condition = { kind: "citys-blessing" };
        return "";
      });
      // "Activate only if you've discarded a card this turn" (Gilt-Blade
      // Prowler): the turn history's discards.
      rest = rest.replace(/ Activate only if you've discarded a card this turn\.$/, () => {
        ability.condition = DISCARDED_THIS_TURN;
        return "";
      });
      // "Activate only if this creature blocked or was blocked by a blue
      // creature this turn" (Sea Troll): the turn's blocks.
      rest = rest.replace(/ Activate only if (?:this creature|~) blocked or was blocked by (.+?) this turn\.$/, (whole, phrase) => {
        const partner = blockPartnerPhrase(phrase);
        if (partner === null) return whole;
        ability.condition = { kind: "source", filter: { blockedThisTurn: { relation: "either", partner } } };
        return "";
      });
      // Grizzled Wolverine: a creature still blocking it, not merely blocked
      // (rule 509.1h), in that one step, once.
      rest = rest.replace(/ Activate only during the declare blockers step, only if at least one creature is blocking ~, and only once each turn\.$/, () => {
        ability.condition = {
          kind: "all",
          of: [{ kind: "turn-structure", steps: ["declare-blockers"] }, { kind: "source", filter: { blockerCount: { op: "gte", n: 1 } } }],
        };
        ability.oncePerTurn = true;
        return "";
      });
      if (/Activate only /.test(rest)) {
        ability.__todo = [`a restriction: "${rest.slice(rest.indexOf("Activate only "))}"`];
        rest = rest.slice(0, rest.indexOf(" Activate only "));
      }
      // A "remove all … counters" cost's count is the ability's X: "…, where
      // X is the number of counters removed this way" reads it as X.
      // So do "damage … equal to the number of … counters removed this way"
      // (Molten Hydra, Torture Chamber) and "that much damage" (Relic Amulet).
      // As do "you gain 2 life for each … counter removed this way" and
      // "-1/-1 … for each" (Essence Bottle, Vish Kal), through `removedIsX`.
      if (ability.cost.removeCounter?.count === "all") {
        rest = rest
          .replace(/, where X is the number of (?:[\w+/-]+ )?counters removed this way\./, ".")
          .replace(/ deals damage to (.+?) equal to the number of (?:[\w+/-]+ )?counters removed this way\./, " deals X damage to $1.")
          .replace(/ deals that much damage to /, " deals X damage to ");
      }
      // "{R}, Sacrifice this creature: It deals 2 damage to …" (Tinder Wall,
      // Barbarian Lunatic): a permanent's own ability, so "it" is its source.
      i = fillEffect(ability, rest, { tokenFor, ...(/^It deals /.test(rest) ? { it: "source" } : {}) }, lines, i);
      manaAbilityExtras(ability);
      out.activated.push(ability);
      continue;
    }

    // Triggered abilities: "When/Whenever/At …, effect".
    if (/^(When|Whenever|At )/.test(line)) {
      const comma = line.indexOf(", ");
      let clause = comma > 0 ? line.slice(0, comma) : line;
      // "Whenever ~ attacks while saddled" (rule 702.171b): saddled is part
      // of the trigger condition (603.1), asked as it attacks — not an
      // intervening "if" (the rulings).
      const whileSaddled = / while saddled$/.test(clause);
      if (whileSaddled) clause = clause.replace(/ while saddled$/, "");
      // "Whenever ~ crews a Vehicle during your main phase" (Canyon Vaulter):
      // part of when it triggers — the turn can't move on with it on the
      // stack, so the ability's condition, asked again, agrees.
      const duringMain = / during your main phase$/.test(clause);
      if (duringMain) clause = clause.replace(/ during your main phase$/, "");
      // "Whenever a time counter is removed from this card while it's exiled"
      // (Benalish Commander), or "when the last" one (Riftmarked Knight):
      // these work while it's suspended.
      const timeCounterOff = /^(Whenever a|When the last) time counter is removed from (?:this card|~) while it's exiled$/.exec(clause);
      const parsedTriggers = timeCounterOff
        ? [{ on: "counters-removed", who: "self", counter: "time", ...(timeCounterOff[1] === "When the last" ? { last: true } : {}) }]
        : parseTrigger(clause);
      if (
        parsedTriggers === null ||
        (whileSaddled && !parsedTriggers.every((t) => t.on === "attacks" && t.who === "self")) ||
        (duringMain && !parsedTriggers.every((t) => t.on === "crews-or-saddles"))
      ) {
        out.todo.push(printed(raw));
        continue;
      }
      let rest = comma > 0 ? line.slice(comma + 2) : "";
      // "When you cycle this card" reading its cycling cost's X (Shark
      // Typhoon) is `{ triggerValue: true }`, not the spell's `"x"` the
      // sentences below would read: a person's.
      if (parsedTriggers.every((t) => t.on === "this-cycled") && /\bX\b/.test(rest)) {
        out.todo.push(printed(raw));
        continue;
      }
      // "That Vehicle" / "that Mount or Vehicle": the trigger object, as "it".
      if (parsedTriggers.every((t) => t.on === "crews-or-saddles")) {
        rest = rest.replace(/^that (?:Mount or Vehicle|Vehicle or Mount|Vehicle|Mount) /, "it ");
      }
      let oncePerTurn = false;
      rest = rest.replace(/ This ability triggers only once each turn\.$/, () => {
        oncePerTurn = true;
        return "";
      });
      const base = {
        targets: [],
        effect: null,
        resolve: null,
        text: printed(raw),
        ...(oncePerTurn ? { oncePerTurn: true } : {}),
        ...(timeCounterOff ? { whileSuspended: true } : {}),
        ...(whileSaddled ? { whileCondition: { kind: "source", filter: { saddled: true } } } : {}),
        ...(duringMain
          ? {
              condition: {
                kind: "all",
                of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
              },
            }
          : {}),
      };
      // "One or more … die. This ability triggers only once each turn": the
      // first death triggers it, in that event or not, so a plain `dies`.
      let triggers = oncePerTurn
        ? parsedTriggers.map((t) => {
            if (t.on !== "dies") return t;
            const { batched: _batched, ...plain } = t;
            return plain;
          })
        : parsedTriggers;
      const meldWhole = MELD_SENTENCE.exec(rest);
      if (meldWhole !== null) {
        // A meld trigger (Graf Rats, Gisela): its intervening if is the
        // `meld-ready` condition, and the `meld` effect makes the same test
        // again as it resolves, so the instruction is read whole — the
        // counterpart's name may hold a comma ("Bruna, the Fading Light").
        base.condition = { kind: "meld-ready", partner: { name: meldWhole[2], type: meldWhole[1].toLowerCase() } };
        rest = rest[0].toUpperCase() + rest.slice(1);
      } else if (/^if /i.test(rest)) {
        // An intervening-if (rule 603.4) is the ability's `condition`: read
        // for the few the engine names, else left to a person.
        const clause = rest.slice(0, rest.indexOf(",") + 1);
        const condition =
          INTERVENING_IFS[clause.toLowerCase()] ??
          devotionIf(clause) ??
          kickedWithIf(clause, out.kicker) ??
          playerStateIf(clause, triggers);
        if (condition !== undefined) base.condition = condition;
        else if (clause.toLowerCase() === "if it had counters on it," && departedOf(triggers) !== undefined) {
          // A permanent that left, read as it last existed: its own counters
          // (a self trigger), or each trigger's filter on what left (the
          // self half of "this or another" too).
          if (departedOf(triggers) === "source") base.condition = { kind: "self-counters", compare: { op: "gte", n: 1 } };
          else triggers = triggers.map((t) => ({ ...t, filter: { ...t.filter, counters: { compare: { op: "gte", n: 1 } } } }));
        } else base.__todo = [`the intervening-if: "${clause}"`];
        rest = rest.slice(rest.indexOf(", ") + 2);
        rest = rest[0].toUpperCase() + rest.slice(1);
      } else rest = rest.length > 0 ? rest[0].toUpperCase() + rest.slice(1) : rest;
      // "Target creature of defending player's choice" (Erithizon), "… of
      // that player's choice" (Bladegriff Prototype): the player the event
      // names chooses the targets (`targetsChosenBy`).
      const namesPlayer = triggers.every((t) => t.on === "attacks" || t.on === "deals-combat-damage-to-player");
      const choiceOf = / of (defending player|that player)'s choice\b/.exec(rest);
      if (choiceOf !== null && namesPlayer && (choiceOf[1] === "that player") === (triggers[0].on !== "attacks")) {
        rest = rest.replace(choiceOf[0], "");
        base.targetsChosenBy = "trigger-player";
      }
      const first = { trigger: triggers[0], ...base };
      const next = fillEffect(
        first,
        rest,
        {
          tokenFor,
          onStack: true,
          it: itOf(triggers),
          departed: departedOf(triggers),
          // "Copy it" in a cast trigger: the spell cast (`"trigger-spell"`).
          ...(triggers.every((t) => t.on === "cast-spell") ? { castSpell: true } : {}),
          ...(thatPlayerOf(triggers) !== undefined ? { thatPlayer: thatPlayerOf(triggers) } : {}),
          // "Those creatures": the attackers of an attack read as one batch.
          ...(triggers.every((t) => t.on === "attacks-batch" || t.on === "attack-with" || t.on === "attacks-player")
            ? { attackBatch: true }
            : {}),
        },
        lines,
        i,
      );
      out.triggered.push(first);
      for (const t of triggers.slice(1)) out.triggered.push({ ...first, trigger: t, targets: [...first.targets] });
      i = next;
      continue;
    }

    // A spell's own text: every line of an instant or sorcery is its effect.
    if (isSpell) {
      out.spellLines = [...(out.spellLines ?? []), { raw, line, index: i }];
      continue;
    }
    out.todo.push(printed(raw));
  }
  flushLevel();

  // A spell: its lines are one effect (a modal one if it opens "Choose …").
  if (out.spellLines) {
    const modal = parseModalSpell(out.spellLines, { tokenFor, onStack: true, spell: true });
    if (modal !== undefined) {
      if (modal === null) out.todo.push(...out.spellLines.map((l) => printed(l.raw)));
      else {
        Object.assign(out, modal);
        // Entwine (rule 702.42): every mode when the entwine cost is paid.
        if (out.kicker?.keyword === "entwine") out.castModal = { ...out.castModal, kickedModes: out.castModal.modes.length };
      }
    } else {
      const ctx2 = {
        targets: spellTargets,
        tokenFor,
        onStack: true,
        spell: true,
        opponentChoosesTargets: [],
        divided: {},
        // "As an additional cost …, discard a card": "the discarded card".
        ...(out.additionalCost?.discard === 1 ? { costDiscarded: true } : {}),
        // "…, exile a creature card from your graveyard": "the exiled card".
        ...(out.additionalCost?.exileFromGraveyard?.count === 1 ? { costExiled: true } : {}),
        // "…, reveal a creature card from your hand": "the revealed card".
        ...(out.additionalCost?.behold?.fromHand === true &&
        out.additionalCost.behold.exile !== true &&
        (out.additionalCost.behold.count ?? 1) === 1
          ? { costRevealed: true }
          : {}),
      };
      let text = out.spellLines.map((l) => l.line).join(" ");
      // "…. Exile Burning Wish." closing the spell: it's exiled as it
      // resolves instead of going to the graveyard (`exileOnResolve`).
      const exiles = /^(.+\.) Exile ~\.$/.exec(text);
      if (exiles !== null) {
        text = exiles[1];
        out.exileOnResolve = true;
      }
      // "If a Dragon was beheld, …" / "If this spell's additional cost was
      // paid, …" closing a "you may behold" spell (rules 701.4b, 607.2i):
      // the kicked cast does that too — its effect the spell's and then
      // this, with any target it adds after the spell's own. Not an
      // "instead", which rewrites the spell's text: that's a person's.
      let kickedTail;
      if (
        out.kicker?.keyword === "behold" ||
        out.kicker?.keyword === "waterbend" ||
        out.kicker?.keyword === "bargain" ||
        out.kicker?.keyword === "reveal"
      ) {
        const sentences = sentencesOf(text);
        const last = sentences.at(-1) ?? "";
        const tail =
          /^If (?:a|an) .+ was beheld, (.+)$/.exec(last) ??
          // "If you revealed a Dragon card or controlled a Dragon as you
          // cast this spell, …" (`kicker.orControls`).
          /^If you revealed (?:a|an) .+ card or controlled (?:a|an) .+ as you cast ~, (.+)$/.exec(last) ??
          /^If ~'s additional cost was paid, (.+)$/.exec(last) ??
          // "If this spell was bargained, …" (rule 702.166b).
          /^If ~ was bargained, (.+)$/.exec(last);
        if (tail !== null && sentences.length > 1 && !/\binstead\b/.test(last)) {
          text = sentences.slice(0, -1).join(" ");
          kickedTail = { sentence: last, rest: `${tail[1][0].toUpperCase()}${tail[1].slice(1)}` };
        }
      }
      const r = parseEffect(text, ctx2);
      const ownTargets = [...spellTargets];
      out.targets = ownTargets;
      // A divided amount (rule 601.2d): the spell's `divided`, its group the
      // last slot — any other place is a person's.
      const division = r.effect === null ? undefined : ctx2.divided.value;
      const misplaced = division !== undefined && division.slot !== ownTargets.length - 1;
      out.effect = misplaced ? null : r.effect;
      if (division !== undefined && !misplaced) out.divided = division;
      if (misplaced) out.todo.push("a divided amount whose group isn't the last target");
      if (r.effect === null) {
        out.todo.push(...r.todo);
        out.effectHints = r.hints;
      } else if (ctx2.opponentChoosesTargets.length > 0) {
        // "Target … of an opponent's choice" (rule 601.2c).
        out.opponentChoosesTargets = [...ctx2.opponentChoosesTargets];
      }
      // Awaken (rule 702.113a): the awaken cast's targets and effect are the
      // spell's own and then the land's.
      if (out.awakenKeyword !== undefined && r.effect !== null) {
        out.overload = awaken(out.awakenKeyword.n, out.awakenKeyword.cost, { targets: ownTargets, effect: r.effect });
      }
      if (kickedTail !== undefined) {
        let extra = r.effect === null ? { effect: null } : parseEffect(kickedTail.rest, ctx2);
        // A bonus that reads back into the spell ("… deals 3 damage to that
        // creature's controller" — Draconic Roar) is read with it: the whole
        // text as the kicked effect, when it names no target of its own.
        if (r.effect !== null && extra.effect === null) {
          const both = parseEffect(`${text} ${kickedTail.rest}`, { ...ctx2, targets: [] });
          const steps = (e) => (e.kind === "sequence" && e.simultaneous !== true ? e.effects : [e]);
          if (both.effect !== null && steps(both.effect).length > steps(r.effect).length && ctx2.targets.length === ownTargets.length) {
            out.kicker = { ...out.kicker, effect: both.effect };
            extra = { effect: null, done: true };
          }
        }
        if (extra.done === true) {
          // Read whole above.
        } else if (extra.effect === null) out.todo.push(kickedTail.sentence);
        else {
          const steps = (e) => (e.kind === "sequence" && e.simultaneous !== true ? e.effects : [e]);
          out.kicker = {
            ...out.kicker,
            ...(spellTargets.length > ownTargets.length ? { targets: [...spellTargets] } : {}),
            effect: { kind: "sequence", effects: [...steps(r.effect), ...steps(extra.effect)] },
          };
        }
      }
    }
    delete out.spellLines;
  }
  // An awaken line over a spell not read whole (or a modal one) is a person's.
  if (out.awakenKeyword !== undefined && out.overload === undefined) {
    out.todo.push(printed(lines.find((l) => /^Awaken \d/.test(l)) ?? "Awaken"));
  }
  delete out.awakenKeyword;

  // "Cards exiled with ~" (rule 607.2a): the card's own exiles are linked to
  // the abilities that read them — Boiling Rock Rioter's "exile target card
  // from a graveyard" and "cast an Ally spell from among cards you own exiled
  // with this creature" — or "exiled with it" (Myr Welder). So are the old
  // two-trigger wording's (Leonin Relic-Warder's "you may exile target
  // artifact" and "when this leaves, return the exiled card"). An exile until
  // ~ leaves is linked another way.
  const oracleText = face.oracle_text ?? "";
  if (
    /\bexiled with (?:this \w+|it)\b/.test(oracleText) ||
    /\breturn the exiled card\b/.test(oracleText) ||
    // Hoarding Dragon's "you may put the exiled card into its owner's hand".
    /\bput the exiled card into\b/.test(oracleText) ||
    /\bsame name as the exiled card\b/.test(oracleText) ||
    (face.name !== undefined && oracleText.includes(`exiled with ${face.name}`))
  ) {
    const linkExiles = (node) => {
      if (Array.isArray(node)) node.forEach(linkExiles);
      else if (node !== null && typeof node === "object") {
        if (node.kind === "exile" && node.untilSourceLeaves !== true) node.linked = true;
        // Nautiloid Ship's "exile target player's graveyard", Skyship
        // Weatherlight's "search … exile them".
        if (node.kind === "exile-graveyard") node.linked = true;
        // Muse Vessel's "target player exiles a card from their hand".
        if (node.kind === "look-and-choose" && node.destination === "exile") delete node.unlinked;
        if (node.kind === "search-library" && (node.destination === "exile" || node.destination === "exile-face-down")) {
          node.linked = true;
        }
        for (const v of Object.values(node)) linkExiles(v);
      }
    };
    linkExiles([out.activated, out.triggered, out.effect]);
  }
  // "When this creature's echo cost is paid" (Shah of Naar Isle) has to trigger
  // from the echo trigger's resolution, which `echo()`'s `unless` never says:
  // that echo is the author's to write, as a `may`.
  if (/echo cost is paid/i.test(face.oracle_text ?? "")) {
    for (const t of out.triggered) {
      if (/^Echo\b/.test(t.text ?? "")) t.__todo = [...(t.__todo ?? []), "its echo has to say when the cost is paid"];
    }
  }
  // "When a player doesn't pay this enchantment's cumulative upkeep" (Heart of
  // Bogardan) is the upkeep's own "if you don't", which `cumulativeUpkeep()`'s
  // `unless` never says: the author writes the upkeep with it.
  if (/doesn't pay [^.]*cumulative upkeep/i.test(face.oracle_text ?? "")) {
    for (const t of out.triggered) {
      if (/^Cumulative upkeep\b/.test(t.text ?? "")) t.__todo = [...(t.__todo ?? []), "its cumulative upkeep has to say what happens when it isn't paid"];
    }
  }
  out.complete =
    out.todo.length === 0 &&
    [...out.activated, ...out.triggered].every((a) => a.effect !== null && a.__todo === undefined);
  // A "you may" question is shown to the player: "~" in it is the card's name.
  const namePrompts = (node) => {
    if (Array.isArray(node)) node.forEach(namePrompts);
    else if (node !== null && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (k === "prompt" && typeof v === "string" && face.name !== undefined) node[k] = v.replaceAll("~", face.name);
        else namePrompts(v);
      }
    }
  };
  namePrompts([out.activated, out.triggered, out.static, out.effect]);
  // "…except it has this ability" (rule 707.9a): the ability the sentence is
  // in, named by the card and its place in the card's list (`thisAbility`).
  const nameThisAbility = (node, where) => {
    if (Array.isArray(node)) node.forEach((n) => nameThisAbility(n, where));
    else if (node !== null && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) {
        if (k === "thisAbility" && v === THIS_ABILITY) node[k] = { card: face.name, ...where };
        else nameThisAbility(v, where);
      }
    }
  };
  out.activated.forEach((a, i) => nameThisAbility(a.effect, { activated: i }));
  out.triggered.forEach((a, i) => nameThisAbility(a.effect, { triggered: i }));
  // "Cards exiled with ~" elsewhere on the card: its abilities that exile the
  // top of a library are the other half of the link (rule 607.2a).
  if (/\bexiled with\b/i.test(face.oracle_text ?? "")) {
    const linkedExile = (node) => {
      if (Array.isArray(node)) node.forEach(linkedExile);
      else if (node !== null && typeof node === "object") {
        if (node.kind === "exile-from-library") node.linked = true;
        Object.values(node).forEach(linkedExile);
      }
    };
    [...out.activated, ...out.triggered].forEach((a) => linkedExile(a.effect));
  }
  // A card with bestow can be an Aura: its own "dies" leave-triggers read as
  // their rules do, "put into a graveyard from the battlefield" (afterlife,
  // rule 702.135a), so they trigger as an Aura too (Indebted Spirit).
  if (out.bestow !== undefined) {
    for (const a of out.triggered) {
      if (a.trigger?.on === "dies" && a.trigger.who === "self" && /^Afterlife \d+/.test(a.text ?? "")) {
        a.trigger = { on: "leaves-battlefield", who: "self", to: ["graveyard"] };
      }
    }
  }
  return out;
}

/** One cost of a "by …" graveyard permission ("paying 3 life", "discarding
 * a card", "exiling another creature card from your graveyard", "sacrificing
 * an artifact or creature") as `GraveyardCastCosts` fields, or `null`. */
function graveyardCastCost(part) {
  let m;
  if ((m = /^paying (\d+) life$/.exec(part))) return { payLife: Number(m[1]) };
  if ((m = /^discarding (a|one|two|three) cards?$/.exec(part))) return { discard: NUMBERS[m[1]] };
  if ((m = /^exiling (another|one other|two other|three other|four other|five other|six other) (creature )?cards? from your graveyard$/.exec(part))) {
    const count = m[1] === "another" ? 1 : NUMBERS[m[1].split(" ")[0]];
    return { exileOthers: count, ...(m[2] ? { exileFilter: { type: "creature" } } : {}) };
  }
  const SACRIFICE = {
    "an artifact or creature": { typesAnyOf: ["artifact", "creature"] },
    "a creature": { type: "creature" },
    "an artifact": { type: "artifact" },
    "a land": { type: "land" },
  };
  if ((m = /^sacrificing (.+)$/.exec(part)) && SACRIFICE[m[1]] !== undefined) return { sacrifice: SACRIFICE[m[1]] };
  return null;
}

/**
 * "You may cast ~ from your graveyard [or from exile] [by … in addition to
 * paying its other costs | by paying {cost} [and …] rather than paying its
 * mana cost | if you pay {1} more to cast it for each other creature card
 * in your graveyard]." — a card's `castSelfFromGraveyard`, or `null`.
 */
function selfGraveyardCast(line) {
  const m = /^You may cast ~ from your graveyard( or from exile)?(?: (.+))?\.$/.exec(line);
  if (m === null) return null;
  const out = m[1] ? { fromExile: true } : {};
  const rest = m[2];
  if (rest === undefined) return m[1] ? out : null;
  if (rest === "if you pay {1} more to cast it for each other creature card in your graveyard") {
    return { ...out, costIncreasePerOther: { type: "creature" } };
  }
  let costs;
  let alt;
  if ((alt = /^by paying ((?:\{[^}]+\})+)(?: and (.+))? rather than paying its mana cost$/.exec(rest))) {
    out.mana = alt[1];
    costs = alt[2] === undefined ? [] : alt[2].split(/, and |, | and /);
  } else if ((alt = /^by (.+) in addition to paying its other costs$/.exec(rest))) {
    costs = alt[1].split(/, and |, | and /);
  } else {
    return null;
  }
  for (const part of costs) {
    const cost = graveyardCastCost(part);
    if (cost === null) return null;
    Object.assign(out, cost);
  }
  return out;
}

/** Stands for "this ability" in a copy exception until `parseFace` knows
 * which ability the sentence is in. */
const THIS_ABILITY = "this ability";

/** "As long as you have max speed" (rules 702.178a, 702.179e) — the
 * `maxSpeed()` helper's condition. */
const MAX_SPEED = { kind: "speed", atLeast: 4 };

/**
 * "Equipped creature has '…'" / "Enchanted creature has '…'" naming the
 * granting permanent by name (rule 201.5a): a granted activated ability whose
 * cost sacrifices the granter (`sacrifice: "granter"`), whose damage the
 * granter deals (`from: "granter"`), or which returns the granter to its
 * owner's hand. `undefined` for a line that isn't such a grant, `null` for
 * one it can't read whole.
 */
function granterNamingGrant(face, raw, ctx) {
  const m = /^(?:Equipped|Enchanted) creature has "([^"]+)"$/.exec(raw);
  if (m === null) return undefined;
  const inner = m[1];
  const short = face.name.split(",")[0];
  const G = "\u0002";
  let s = inner.split(face.name).join(G);
  if (short !== face.name && short.length >= 3) s = s.replace(new RegExp(`\\b${escapeRe(short)}\\b`, "g"), G);
  // One that doesn't name its granter isn't this template's.
  if (!s.includes(G)) return undefined;
  // An activated ability only; its cost may sacrifice the granter.
  const colon = s.indexOf(": ");
  if (colon < 0 || /^(When|Whenever|At )/.test(s)) return null;
  const parts = s.slice(0, colon).split(", ");
  const sacrificeGranter = parts.includes(`Sacrifice ${G}`);
  // "{T}, Unattach Leonin Bola" (rule 701.3d): nothing else to pay is fine.
  const unattachGranter = parts.includes(`Unattach ${G}`);
  const costParts = parts.filter((p) => p !== `Sacrifice ${G}` && p !== `Unattach ${G}`);
  const cost = costParts.join(", ");
  // Each sentence naming the granter, read as the bearer's and then
  // pointed at the granter: "[it] deals …" (the damage's source) and
  // "Return [it] to its owner's hand".
  const sentences = sentencesOf(s.slice(colon + 2));
  const fromGranter = new Set();
  const returnGranter = new Set();
  const rewritten = sentences.map((sentence, i) => {
    // "It deals" is the granter too (Razor Boomerang's ruling).
    const deals = new RegExp(`^(?:${G}|It) deals (.+)$`).exec(sentence);
    if (deals !== null) {
      fromGranter.add(i);
      return `This creature deals ${deals[1]}`;
    }
    if (sentence === `Return ${G} to its owner's hand.`) {
      returnGranter.add(i);
      return "Return this creature to its owner's hand.";
    }
    return sentence;
  });
  if ((cost === "" && !unattachGranter) || cost.includes(G) || rewritten.some((r) => r.includes(G))) return null;
  // Blinding Powder's cost is the unattach alone: read with a stand-in.
  const read = parseFace({ name: "Granted Bearer", type_line: "Creature", oracle_text: `${cost === "" ? "{0}" : cost}: ${rewritten.join(" ")}` }, ctx);
  if (!read.complete || read.activated.length !== 1 || read.static.length + read.triggered.length + read.keywords.length > 0) return null;
  const known = new Set(["keywords", "activated", "triggered", "static", "todo", "complete"]);
  if (Object.keys(read).some((k) => !known.has(k))) return null;
  const ability = read.activated[0];
  const patch = (effect, i) =>
    fromGranter.has(i)
      ? effect?.kind === "damage" && effect.from === undefined ? { ...effect, from: "granter" } : null
      : returnGranter.has(i)
        ? effect?.kind === "return-to-hand" && effect.target === "source" ? { ...effect, target: "granter" } : null
        : effect;
  let effect;
  if (sentences.length === 1) effect = patch(ability.effect, 0);
  else if (ability.effect?.kind === "sequence" && ability.effect.effects.length === sentences.length) {
    const effects = ability.effect.effects.map(patch);
    effect = effects.some((e) => e === null) ? null : { ...ability.effect, effects };
  } else effect = null;
  if (effect === null) return null;
  return {
    affects: { scope: "attached" },
    grantsActivated: [
      {
        ...ability,
        cost: {
          ...ability.cost,
          ...(cost === "" ? { mana: null } : {}),
          ...(sacrificeGranter ? { sacrifice: "granter" } : {}),
          ...(unattachGranter ? { unattach: "granter" } : {}),
        },
        effect,
        text: inner,
      },
    ],
    text: printed(raw),
  };
}

/**
 * One "Max speed — [ability]" line's ability (rule 702.178a), `inner` the
 * printed ability and `text` the whole printed line: read as a line of its
 * own, then gated on max speed. A static of the card's own gets the
 * condition; activated and triggered abilities become a static granting them
 * (`grantsActivated`, `grantsTriggered`), as `maxSpeed()` writes them — save
 * one that works from the graveyard (702.178b), which keeps its place with
 * the condition, and "You may cast this card from your graveyard", the
 * card's `castFromGraveyardIf`. `null` for anything else, or anything the
 * line's own reading left to a person.
 */
function maxSpeedLine(face, inner, text, ctx) {
  if (normalize(inner, face.name) === "You may cast ~ from your graveyard.") {
    return { activated: [], static: [], card: { castFromGraveyardIf: MAX_SPEED } };
  }
  const read = parseFace({ ...face, oracle_text: inner }, ctx);
  if (!read.complete || read.keywords.length > 0 || read.effect !== undefined) return null;
  const known = new Set(["keywords", "activated", "triggered", "static", "todo", "complete"]);
  if (Object.keys(read).some((k) => !known.has(k))) return null;
  const activated = [];
  const statics = [];
  const grantsActivated = [];
  for (const ability of read.activated) {
    if (ability.zone === "graveyard" && ability.condition === undefined) activated.push({ ...ability, condition: MAX_SPEED, text });
    else if (ability.zone === undefined) grantsActivated.push(ability);
    else return null;
  }
  for (const st of read.static) {
    if (st.affects?.scope !== "self" || st.condition !== undefined || st.fromGraveyard !== undefined) return null;
    statics.push({ ...st, condition: MAX_SPEED, text });
  }
  if (grantsActivated.length > 0 || read.triggered.length > 0) {
    if (statics.length > 0) return null;
    statics.push({
      affects: { scope: "self" },
      ...(grantsActivated.length > 0 ? { grantsActivated } : {}),
      ...(read.triggered.length > 0 ? { grantsTriggered: read.triggered } : {}),
      condition: MAX_SPEED,
      text,
    });
  }
  if (activated.length + statics.length === 0) return null;
  return { activated, static: statics, card: {} };
}

/** Void (Edge of Eternities): a nonland permanent — anyone's — left the
 * battlefield this turn, or a spell — anyone's — was cast for its warp cost
 * (rule 702.185c). */
const VOID_CONDITION = {
  kind: "any",
  of: [
    { kind: "turn-history", what: "left", who: "any-player", filter: { notTypes: ["land"] } },
    { kind: "cast-this-turn", who: "any", filter: { castVia: "warp" } },
  ],
};
/** Revolt (Aether Revolt), disappear (TMNT): a permanent you controlled as
 * it left left the battlefield this turn. */
const REVOLT_CONDITION = { kind: "turn-history", what: "left" };
/** Celebration (Wilds of Eldraine): two or more nonland permanents entered
 * under your control this turn, read as they entered, though they've left or
 * changed control since. */
const CELEBRATION_CONDITION = { kind: "turn-history", what: "entered", filter: { notTypes: ["land"] }, atLeast: 2 };

/** "There are five or more mana values among cards in your graveyard". */
const FIVE_MANA_VALUES = {
  kind: "aggregate",
  value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
  compare: { op: "gte", n: 5 },
};

/** A static's trailing "as long as …" by its words, and the `condition` it
 * becomes (`parseStatic`). */
const STATIC_CONDITION_SUFFIXES = [
  [" as long as two or more nonland permanents entered the battlefield under your control this turn.", CELEBRATION_CONDITION],
  // Ascend (rule 702.131 — Rivals of Ixalan): "~ gets +2/+2 as long as you
  // have the city's blessing" (Dusk Charger).
  [" as long as you have the city's blessing.", { kind: "citys-blessing" }],
  // "… as long as two or more creatures are blocking it" (Rampaging Cyclops).
  [" as long as two or more creatures are blocking it.", { kind: "source", filter: { blockerCount: { op: "gte", n: 2 } } }],
  // The turn's attack history: "… as long as it attacked this turn" (Agent
  // Frank Horrigan), "… as long as it attacked a battle this turn" (War
  // Historian, rule 506.3), "… as long as it entered this turn" (Crew Captain).
  [" as long as it attacked this turn.", { kind: "source", filter: { attackedThisTurn: true } }],
  [" as long as it attacked a battle this turn.", { kind: "source", filter: { attackedBattleThisTurn: true } }],
  [" as long as it entered this turn.", { kind: "source", filter: { enteredThisTurn: true } }],
];
/** The same, leading: "As long as you have the city's blessing, ~ has
 * hexproof" (Slippery Scoundrel). */
const STATIC_CONDITION_PREFIXES = [
  ["As long as you have the city's blessing, ", { kind: "citys-blessing" }],
  // Renowned (rule 702.112b): "As long as ~ is renowned, it has menace"
  // (Goblin Glory Chaser) — the "it" is ~.
  ["As long as ~ is renowned, ", { kind: "source", filter: { renowned: true } }],
  // Winter Orb, Static Orb, Storage Matrix.
  ["As long as ~ is untapped, ", { kind: "source", filter: { tapped: false } }],
  // Queen Mother Ramonda.
  ["As long as you're the monarch, ", { kind: "monarch", who: "you" }],
  // Murders at Karlov Manor's "five or more mana values among cards in your
  // graveyard" (Aven Heartstabber): a `distinct` aggregate there.
  ["As long as there are five or more mana values among cards in your graveyard, ", FIVE_MANA_VALUES],
];

/** "If you've discarded a card this turn" — the turn history's discards. */
const DISCARDED_THIS_TURN = { kind: "turn-history", what: "discarded" };
/** The turn history's graveyard tallies as conditions, by their words: an
 * intervening "if" of a trigger (Ichor Shade, Mysterio's Mirage), a spell's
 * "If …, draw a card." (Recalibrate). */
const TURN_TALLY_IFS = {
  // Dragon Whelp's: activations of this ability so far this turn, resolved
  // or not.
  "if this ability has been activated four or more times this turn,": { kind: "activated-this-turn", atLeast: 4 },
  "if a player discarded a card this turn,": { kind: "turn-history", what: "discarded", who: "any-player" },
  // Counters put this turn (`CountersPutSpec`).
  "if you put a counter on a creature this turn,": { kind: "counters-put-this-turn", onType: "creature" },
  "if a +1/+1 counter was put on a permanent under your control this turn,": {
    kind: "counters-put-this-turn",
    by: "any-player",
    counter: "+1/+1",
    onYours: true,
  },
  "if you discarded a card this turn,": DISCARDED_THIS_TURN,
  "if you've discarded a card this turn,": DISCARDED_THIS_TURN,
  "if an artifact or creature was put into a graveyard from the battlefield this turn,": {
    kind: "turn-history",
    what: "to-graveyard",
    who: "any-player",
    from: ["battlefield"],
    filter: { typesAnyOf: ["artifact", "creature"] },
  },
  "if a permanent was put into a graveyard from the battlefield this turn,": {
    kind: "turn-history",
    what: "to-graveyard",
    who: "any-player",
    from: ["battlefield"],
  },
  // Controlled as it left (rule 603.10a) — any owner's graveyard (The Lady
  // of Otaria).
  "if a land you controlled was put into a graveyard from the battlefield this turn,": {
    kind: "turn-history",
    what: "to-graveyard",
    who: "any-player",
    from: ["battlefield"],
    filter: { type: "land", controlledBy: "you" },
  },
  "if an enchantment was put into your graveyard from the battlefield this turn,": {
    kind: "turn-history",
    what: "to-graveyard",
    from: ["battlefield"],
    filter: { type: "enchantment" },
  },
  "if three or more cards were put into your graveyard from anywhere other than the battlefield this turn,": {
    kind: "turn-history",
    what: "to-graveyard",
    notFrom: ["battlefield"],
    atLeast: 3,
  },
};

/** A meld card's whole instruction (rule 701.42): the counterpart's card
 * type and name, and the combined back face. "~" is the card itself. */
const MELD_SENTENCE =
  /^if you both own and control (?:~|this (?:creature|land|artifact)) and an? (creature|land|artifact) named (.+?), exile them, then meld them into (.+)\.$/i;

/** Intervening-ifs (rule 603.4) by their words, as the pool writes them:
 * raid (Alesha), morbid (Liliana's Devotee), void (Elegy Acolyte), revolt
 * (Hidden Stockpile) and celebration (Pests of Honor). */
const INTERVENING_IFS = {
  ...TURN_TALLY_IFS,
  // Murders at Karlov Manor (Sanguine Spy).
  "if there are five or more mana values among cards in your graveyard,": FIVE_MANA_VALUES,
  // Amonkhet's Deserts (Desert's Hold, Unquenchable Thirst, Wretched Camel).
  "if you control a desert or there is a desert card in your graveyard,": {
    kind: "any",
    of: [
      { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
      { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
    ],
  },
  // Historian's Wisdom, Might Makes Right: `greatestInZone` over the battlefield.
  "if enchanted permanent is a creature with the greatest power among creatures on the battlefield,": {
    kind: "source",
    filter: { attachedTo: GREATEST_POWER_HERE },
  },
  "if you control each creature on the battlefield with the greatest power,": {
    kind: "not",
    of: { kind: "opponent-controls", atLeast: 1, filter: GREATEST_POWER_HERE },
  },
  // Keldon Twilight, Charging Cinderhorn: nobody's creatures, whoever's turn.
  "if no creatures attacked this turn,": { kind: "not", of: { kind: "turn-stat", stat: "attacked", who: "any-player", atLeast: 1 } },
  // Coven (Midnight Hunt) and day/night (rule 731.1).
  "if you control three or more creatures with different powers,": { kind: "coven" },
  "if it's night,": { kind: "day-night", is: "night" },
  // Opal Guardian, Veiled Serpent (Hidden Spider's shape): rule 603.4, read of itself.
  "if ~ is an enchantment,": { kind: "source", filter: { type: "enchantment" } },
  "if it's day,": { kind: "day-night", is: "day" },
  "if you attacked this turn,": { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
  // Pack tactics: the attackers' total power, as they were declared.
  "if you attacked with creatures with total power 6 or greater this combat,": {
    kind: "turn-stat",
    stat: "power-attacked-with-this-combat",
    who: "you",
    atLeast: 6,
  },
  "if a creature died this turn,": { kind: "creature-died-this-turn" },
  // The Innistrad werewolves' transforms: the previous turn's spells.
  "if no spells were cast last turn,": { kind: "spells-cast-last-turn", none: true },
  "if a player cast two or more spells last turn,": { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
  "if a nonland permanent left the battlefield this turn or a spell was warped this turn,": VOID_CONDITION,
  "if a permanent left the battlefield under your control this turn,": REVOLT_CONDITION,
  "if a permanent you controlled left the battlefield this turn,": REVOLT_CONDITION,
  "if two or more nonland permanents entered the battlefield under your control this turn,": CELEBRATION_CONDITION,
  // How its spell was cast (rule 702.188a): the permanent keeps `castVia`.
  "if it was cast using web-slinging,": { kind: "source", filter: { castVia: "web-slinging" } },
  "if they were cast using web-slinging,": { kind: "source", filter: { castVia: "web-slinging" } },
  "if ~ was cast using web-slinging,": { kind: "source", filter: { castVia: "web-slinging" } },
  "if ~ has counters on it,": { kind: "self-counters", compare: { op: "gte", n: 1 } },
  // Rule 702.112b: the source's renowned designation.
  "if it's renowned,": { kind: "source", filter: { renowned: true } },
  "if ~ is renowned,": { kind: "source", filter: { renowned: true } },
  // Rule 700.13 (Outlaws of Thunder Junction).
  "if you've committed a crime this turn,": { kind: "committed-crime-this-turn" },
  // Rule 701.59c: the spell's collect-evidence additional cost was paid.
  "if evidence was collected,": { kind: "self-kicked" },
  // Rule 702.166b: the permanent's spell was bargained.
  "if it was bargained,": { kind: "self-kicked" },
  "if ~ was bargained,": { kind: "self-kicked" },
  // Rule 702.33d: the permanent's spell was kicked.
  "if it was kicked,": { kind: "self-kicked" },
  "if ~ was kicked,": { kind: "self-kicked" },
  // Rule 702.137a: the permanent's spell was cast for its spectacle cost.
  "if its spectacle cost was paid,": { kind: "self-spectacle-paid" },
  "if ~'s spectacle cost was paid,": { kind: "self-spectacle-paid" },
  // Rule 702.117a: the permanent's spell was cast for its surge cost.
  "if its surge cost was paid,": { kind: "self-surge-paid" },
  "if ~'s surge cost was paid,": { kind: "self-surge-paid" },
  // Rule 702.76a: the permanent's spell was cast for its prowl cost.
  "if its prowl cost was paid,": { kind: "self-prowl-paid" },
  "if ~'s prowl cost was paid,": { kind: "self-prowl-paid" },
  // Rule 702.104b: the chosen opponent didn't pay the tribute.
  "if tribute wasn't paid,": { kind: "tribute-not-paid" },
  // Rule 726 / 309.7 (Battle for Baldur's Gate, Adventures in the Forgotten Realms).
  "if you have the initiative,": { kind: "initiative", who: "you" },
  "if you've completed a dungeon,": { kind: "completed-dungeon" },
  // Rule 700.8c (Zendikar Rising).
  "if you have a full party,": { kind: "full-party" },
  // Rule 702.131 (Rivals of Ixalan's ascend).
  "if you have the city's blessing,": { kind: "citys-blessing" },
};

/** "If your devotion to white and black is seven or greater," (March of the
 * Canonized — rule 700.5) as a `devotion` condition, or `undefined`. */
/** "if it was kicked with its [A] kicker," / "… twice," on a card with two
 * kicker costs (rule 702.33f — `kicker.second`). */
function kickedWithIf(clause, kicker) {
  if (kicker?.second === undefined) return undefined;
  const m = /^if (?:it|~) was kicked (?:with its ((?:\{[^}]+\})+) kicker|(twice)),$/.exec(clause);
  if (m === null) return undefined;
  if (m[2] === "twice") return { kind: "self-kicked", with: "both" };
  if (m[1] === kicker.cost) return { kind: "self-kicked", with: "first" };
  if (m[1] === kicker.second) return { kind: "self-kicked", with: "second" };
  return undefined;
}

/**
 * A conditional flash's clause (`CardDefinition.flashIf`) — "you control a
 * Human", "you control a green or blue permanent", "there are two or more
 * instant and/or sorcery cards in your graveyard", "it targets a permanent
 * you control", "it targets a commander" — or `null` for one the parser
 * doesn't read.
 */
function flashIfOf(clause) {
  const COLORS = { white: "W", blue: "U", black: "B", red: "R", green: "G" };
  let m = /^it targets an? (.+)$/.exec(clause);
  if (m !== null) {
    if (m[1] === "commander") return { targets: { isCommander: true } };
    const mine = / you control$/.test(m[1]);
    const filter = parseTypePhrase(m[1].replace(/ you control$/, ""));
    if (filter === null || (!mine && Object.keys(filter).length === 0)) return null;
    return { targets: { ...filter, ...(mine ? { controlledBy: "you" } : {}) } };
  }
  m = /^you control an? (white|blue|black|red|green) or (white|blue|black|red|green) permanent$/.exec(clause);
  if (m !== null) {
    return { condition: { kind: "controls", filter: { anyOf: [{ colors: [COLORS[m[1]]] }, { colors: [COLORS[m[2]]] }] }, atLeast: 1 } };
  }
  m = /^you control an? (.+)$/.exec(clause);
  if (m !== null) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { condition: { kind: "controls", filter, atLeast: 1 } };
  }
  // Graveyard Shift.
  if (clause === "there are five or more mana values among cards in your graveyard") return { condition: FIVE_MANA_VALUES };
  m = new RegExp(`^there are ${N} or more (.+) cards in your graveyard$`).exec(clause);
  if (m !== null) {
    const n = numberOf(m[1]);
    const filter = parseTypePhrase(m[2], { cards: true });
    if (typeof n !== "number" || filter === null) return null;
    return { condition: { kind: "cards-in-graveyard", atLeast: n, filter } };
  }
  return null;
}

function devotionIf(clause) {
  const m = new RegExp(`^if your devotion to ${DEVOTION} is ${N} or (greater|less),$`).exec(clause);
  if (m === null) return undefined;
  const n = numberOf(m[3]);
  if (typeof n !== "number") return undefined;
  return { kind: "devotion", colors: devotionColors(m[1], m[2]), ...(m[4] === "greater" ? { atLeast: n } : { atMost: n }) };
}

const COMPARED_STATS = { "cards in hand": "hand", life: "life" };

/**
 * A number of yours against another player's, the clause alone (no "if", no
 * comma): "an opponent has more life than you", "you have less life than an
 * opponent", "you control fewer creatures than an opponent". With a lone player
 * target, "that player has more cards in hand than you" (Pulse of the Dross)
 * and "that player or that planeswalker's controller has more life than you"
 * (Pulse of the Forge). `undefined` for any other clause.
 */
function playerComparisonOf(clause, ctx) {
  const c = clause.toLowerCase();
  let m = /^an opponent has more (cards in hand|life) than you$/.exec(c);
  if (m !== null) return { kind: "player-compare", stat: COMPARED_STATS[m[1]], compare: "fewer", than: "an-opponent" };
  m = /^you have (more|less|fewer) (cards in hand|life) than an opponent$/.exec(c);
  if (m !== null) {
    return { kind: "player-compare", stat: COMPARED_STATS[m[2]], compare: m[1] === "more" ? "more" : "fewer", than: "an-opponent" };
  }
  m = /^(?:an opponent controls more (lands|creatures|artifacts|enchantments) than you|you control fewer (lands|creatures|artifacts|enchantments) than an opponent)$/.exec(c);
  if (m !== null) return { kind: "opponent-controls-more", filter: { type: singular(m[1] ?? m[2]) } };
  const slot = ctx?.targets?.length === 1 ? ctx.targets[0] : undefined;
  m = /^that player has more (cards in hand|life) than you$/.exec(c);
  if (m !== null && (slot === "player" || slot === "opponent")) {
    return { kind: "player-compare", stat: COMPARED_STATS[m[1]], compare: "fewer", than: { target: 0 } };
  }
  if (c === "that player or that planeswalker's controller has more life than you" && slot === "player-or-planeswalker") {
    return { kind: "player-compare", stat: "life", compare: "fewer", than: { controllerOfTarget: 0 } };
  }
  return undefined;
}

/**
 * An intervening-if on a player's state (`of-player`, `player-compare`, a
 * starting-life bound, a count of everyone's permanents) — Lavaborn Muse's
 * "if that player has two or fewer cards in hand,", Septic Rats' "if
 * defending player is poisoned,", Akuta's "if you have more cards in hand
 * than each opponent,", Planar Collapse's "if there are four or more
 * creatures on the battlefield,". "That player" is the active player of a
 * step trigger and the defending player of an attack trigger; `undefined`
 * for any other clause, or a "that player" no trigger here names.
 */
function playerStateIf(clause, triggers) {
  const c = clause.toLowerCase();
  const that = triggers.every((t) => t.on === "step-begins" && t.who !== "you")
    ? "active-player"
    : triggers.every((t) => t.on === "attacks")
      ? "that-player"
      : undefined;
  const ofThat = (condition) => (that === undefined ? undefined : { kind: "of-player", player: that, condition });
  // `N` is a group of its own: m[2] the count's word ("no" too), m[4] the bound.
  let m = new RegExp(`^if (that player|defending player|you) (?:has|have) (no|${N}) (or fewer |or more )?cards? in hand,$`).exec(c);
  if (m !== null) {
    const n = m[2] === "no" ? 0 : numberOf(m[2]);
    if (typeof n !== "number" || (m[2] !== "no" && m[4] === undefined)) return undefined;
    const bounds = m[2] === "no" ? { atMost: 0 } : m[4] === "or fewer " ? { atMost: n } : { atLeast: n };
    return m[1] === "you" ? { kind: "hand-size", ...bounds } : ofThat({ kind: "hand-size", ...bounds });
  }
  m = new RegExp(`^if (that player|defending player) has ${N} or (less|more|greater) life,$`).exec(c);
  if (m !== null) {
    const n = numberOf(m[2]);
    if (typeof n !== "number") return undefined;
    return ofThat({ kind: "life-total", ...(m[3] === "less" ? { atMost: n } : { atLeast: n }) });
  }
  if (/^if (that player|defending player) is poisoned,$/.test(c)) {
    return ofThat({ kind: "player-counters", counter: "poison", who: "you", atLeast: 1 });
  }
  const STATS = { "cards in hand": "hand", life: "life" };
  m = /^if (you have|you control|that player has|that player controls) more (cards in hand|life|lands|creatures|artifacts|enchantments) than each (?:opponent|other player),$/.exec(c);
  if (m !== null) {
    const stat = STATS[m[2]] ?? { controls: { type: singular(m[2]) } };
    const compare = { kind: "player-compare", stat, compare: "more", than: "each-opponent" };
    return m[1].startsWith("you") ? compare : ofThat(compare);
  }
  m = /^if (an opponent|defending player) has more (cards in hand|life) than you,$/.exec(c);
  if (m !== null) {
    const than = m[1] === "an opponent" ? "an-opponent" : that === "that-player" ? "that-player" : undefined;
    return than === undefined ? undefined : { kind: "player-compare", stat: STATS[m[2]], compare: "fewer", than };
  }
  // "If you have more life than an opponent," (Glorious Enforcer) and the rest.
  const compared = playerComparisonOf(c.replace(/^if /, "").replace(/,$/, ""));
  if (compared !== undefined) return compared;
  m = /^if you have at least (\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|fifteen) life more than your starting life total,$/.exec(c);
  if (m !== null) {
    const n = m[1] === "fifteen" ? 15 : numberOf(m[1]);
    return typeof n === "number" ? { kind: "life-total", atLeast: { startingPlus: n } } : undefined;
  }
  if (c === "if your life total is greater than your starting life total,") {
    return { kind: "life-total", atLeast: { startingPlus: 1 } };
  }
  m = new RegExp(`^if there are ${N} or more (other )?(.+) on the battlefield,$`).exec(c);
  if (m !== null) {
    const n = numberOf(m[1]);
    const filter = parseTypePhrase(m[3]);
    if (typeof n !== "number" || filter === null) return undefined;
    return { kind: "controls", filter, atLeast: n, anyController: true, ...(m[2] !== undefined ? { excludeSelf: true } : {}) };
  }
  return undefined;
}

/**
 * What "it" means in a triggered ability's effect: the source itself, when the
 * trigger is about the source ("When ~ dies, it deals 2 damage to any
 * target"), or the object the trigger names ("Whenever a creature you control
 * attacks, it gets +1/+0"). Nothing for a trigger about a step or a player.
 */
/**
 * The player a trigger's "that player" / "defending player" names, as an
 * effect's `chooser`: the active player of "each player's upkeep", the
 * defending player of an attack trigger. `undefined` for any other trigger.
 */
function thatPlayerOf(triggers) {
  if (triggers.every((t) => t.on === "step-begins" && t.who === "any")) return "active-player";
  // "Whenever a permanent is returned to a player's hand, that player …"
  // (Warped Devotion), "put into a player's graveyard" (Liability): whose hand
  // or graveyard it is, its owner's.
  if (triggers.every((t) => t.on === "leaves-battlefield" && t.who === "any" && t.to?.length === 1 && t.filter?.ownedBy === undefined)) {
    return "trigger-owner";
  }
  if (triggers.every((t) => t.on === "attacks")) return "trigger-player";
  // "At the beginning of each opponent's upkeep, … that player's library"
  // (Thieving Amalgam); "deal combat damage to a player, … that player's
  // library" (Orochi Soul-Reaver).
  if (triggers.every((t) => t.on === "step-begins" && t.who === "opponent")) return "active-player";
  if (triggers.every((t) => t.on === "step-begins" && t.who === "attached")) return "active-player";
  if (triggers.every((t) => t.on === "deals-damage-batch" && t.combat === true)) return "trigger-player";
  if (triggers.every((t) => t.on === "deals-combat-damage-to-player")) return "trigger-player";
  // "Whenever a player taps a land for mana, ~ deals 1 damage to that player"
  // (Manabarbs): who activated the mana ability.
  if (triggers.every((t) => t.on === "tapped-for-mana")) return "trigger-player";
  if (triggers.every((t) => t.on === "deals-damage" && t.to === "player")) return "trigger-player";
  // "Whenever a land an opponent controls … enters, … that player" (Invader
  // Parasite), "whenever an opponent casts a … spell, … that player" (Dragonlord
  // Kolaghan): who controls the trigger object.
  if (triggers.every((t) => t.on === "enters-battlefield" && t.filter?.controlledBy === "opponent")) return "trigger-controller";
  if (triggers.every((t) => t.on === "cast-spell" && (t.who === "opponent" || t.who === "any"))) return "trigger-controller";
  // "When the chosen player draws a card with the chosen name, … that
  // player" (Booby Trap): who drew, the drawn card's controller.
  if (triggers.every((t) => t.on === "draws" && t.who === "chosen-player")) return "trigger-controller";
  return undefined;
}

/** The characteristics a face-down permanent has when its effect lists them
 * (rule 708.2), by the words of the sentence that lists them — the engine's
 * `FaceDownAs`. */
const FACE_DOWN_AS = {
  "2/2 cyberman artifact creature": "2/2 Cyberman artifact creature",
  "5/5 artifact creature": "5/5 artifact creature",
  "forest land": "Forest land",
};

/**
 * "Turn target creature face down. It's a 2/2 Cyberman artifact creature."
 * (Cyber Conversion), "… return it to the battlefield face down … It's a
 * Forest land." (Yedora), "Put any number of cards from your hand onto the
 * battlefield face down. They're 5/5 artifact creatures." (Tezzeret): the
 * face-down effect of the first sentence, with the characteristics the
 * second lists (rule 708.2 — `turn-face-down`'s `as`, a `put-onto-
 * battlefield`'s or look-and-choose's `faceDown`). `null` unless the second
 * sentence lists one the engine has.
 */
/**
 * "A black Zombie", "a 1/1 Spirit creature with flying", "5/5 Elemental
 * creatures", "an artifact" — what an object is said to be in addition to
 * its own characteristics, before "in addition to its other …": a base P/T,
 * colours, subtypes and card types in that order, then "with" keywords
 * (`addColors`, `basePt`, `addSubtypes`, `addTypes`, `keywords`). `null`
 * unless every word is read.
 */
function additionOf(phrase) {
  let desc = phrase;
  const out = {};
  const kw = / with (.+)$/i.exec(desc);
  if (kw !== null) {
    const words = kw[1].split(/, and |, | and /i);
    const keywords = words.map((w) => KEYWORDS[w.toLowerCase()]);
    if (keywords.some((k) => k === undefined)) return null;
    out.keywords = keywords;
    desc = desc.slice(0, kw.index);
  }
  desc = desc.replace(/^an? /i, "");
  const pt = /^(\d+)\/(\d+) /.exec(`${desc} `);
  if (pt !== null) {
    out.basePt = [Number(pt[1]), Number(pt[2])];
    desc = desc.slice(pt[0].length);
  }
  if (desc === "") return null;
  for (const word of desc.split(" ")) {
    const lower = word.toLowerCase();
    if (COLOR_WORDS[lower] !== undefined) {
      if (out.addTypes !== undefined || out.addSubtypes !== undefined) return null;
      (out.addColors ??= []).push(COLOR_WORDS[lower]);
    } else if (CARD_TYPES.includes(singular(lower)) && singular(lower) !== "instant" && singular(lower) !== "sorcery") {
      (out.addTypes ??= []).push(singular(lower));
    } else if (/^[A-Z][a-z]+(?:-[A-Z]?[a-z]+)?$/.test(word)) {
      if (out.addTypes !== undefined) return null;
      (out.addSubtypes ??= []).push(singular(word));
    } else {
      return null;
    }
  }
  return out;
}

/**
 * A copy-spell's "except …" (a `CopyExceptions`): "the copy isn't
 * legendary", "it isn't legendary if the spell is legendary" (the same — a
 * nonlegendary spell's copy is nonlegendary anyway), "the copy is an
 * artifact in addition to its other types", "the copy is a 1/1 Spirit in
 * addition to its other types". `null` for anything else.
 */
/** What follows "a token that's a copy of …, except": the token's fixed base
 * P/T, "isn't legendary", and what it is in addition, as `create-token-copy`'s
 * fields. `null` unless every word is read. */
function tokenCopyExceptOf(phrase) {
  const pt = /^(?:the token|it)(?: is|'s) (\d+)\/(\d+)$/i.exec(phrase);
  if (pt !== null) return { basePt: [Number(pt[1]), Number(pt[2])] };
  if (/^it isn't legendary$/i.test(phrase)) return { notLegendary: true };
  const both = /^it isn't legendary and is (.+) in addition to its other types$/i.exec(phrase);
  const also = both?.[1] ?? /^it's (.+) in addition to its other types$/i.exec(phrase)?.[1];
  if (also === undefined) return null;
  const added = additionOf(also);
  if (added === null || added.addColors !== undefined) return null;
  return { ...(both !== null ? { notLegendary: true } : {}), exceptions: added };
}

export function copyExceptOf(phrase) {
  if (/^(?:the copy|it) isn't legendary(?: if the spell is legendary)?$/i.test(phrase)) return { notLegendary: true };
  const m = /^the copy is (.+?) in addition to its other types$/i.exec(phrase);
  if (m === null) return null;
  const out = additionOf(m[1]);
  // Colours "in addition" would say "colors and types".
  return out === null || out.addColors !== undefined ? null : out;
}

/**
 * What a permanent put onto the battlefield is in addition to its own, as
 * the sentence after the move says it (an `EnterTypes`): "That creature is a
 * black Zombie in addition to its other colors and types", "It's a 1/1
 * Spirit creature with flying in addition to its other types", "They're
 * artifacts in addition to their other types", "If it's a creature, it's a
 * Zombie in addition to its other creature types" (`ifCreature`). `null`
 * unless every word is read.
 */
export function enterAsOf(sentence) {
  const m =
    /^(if it's a creature, )?(?:that creature is|it's|it is|they're|they are|each of those creatures is) (.+?) in addition to (?:its|their) other (colors and types|types|creature types)\.$/i.exec(
      sentence,
    );
  if (m === null) return null;
  const out = additionOf(m[2]);
  if (out === null) return null;
  // "Colors and types" only with a colour; a colour only with it. "Its
  // other creature types" names creature types alone.
  if ((m[3].toLowerCase() === "colors and types") !== (out.addColors !== undefined)) return null;
  if (m[3].toLowerCase() === "creature types" && Object.keys(out).some((k) => k !== "addSubtypes")) return null;
  // A P/T only for a creature it is or is made.
  if (out.basePt !== undefined && !(out.addTypes ?? []).includes("creature")) return null;
  if (Object.keys(out).length === 0) return null;
  if (m[1]) out.ifCreature = true;
  return out;
}

/**
 * A move onto the battlefield and, in the next sentence, what the permanent
 * is in addition to its own ({@link enterAsOf}) — one `put-onto-battlefield`
 * with `enterAs` (`addSubtypes` alone, the field Portal to Phyrexia's "It's
 * a Phyrexian" is authored with, when that's all it says), or a
 * look-and-choose / return-from-graveyard to the battlefield with `enterAs`.
 */
function enterAsAt(sentences, i, ctx) {
  const as = enterAsOf(sentences[i + 1] ?? "");
  if (as === null) return null;
  const before = ctx.targets.length;
  const fail = () => {
    ctx.targets.length = before;
    return null;
  };
  const effect = parseSentence(sentences[i], ctx);
  if (effect === null || containsUndefined(effect)) return fail();
  const withAs = (e) => {
    if (e.kind === "put-onto-battlefield" && e.faceDown === undefined && e.enterAs === undefined && e.addSubtypes === undefined && e.setTypes === undefined) {
      const onlySubtypes = Object.keys(as).length === 1 && as.addSubtypes !== undefined;
      return onlySubtypes ? { ...e, addSubtypes: as.addSubtypes } : { ...e, enterAs: as };
    }
    if ((e.kind === "look-and-choose" || e.kind === "return-from-graveyard") && e.destination === "battlefield" && e.enterAs === undefined) {
      return { ...e, enterAs: as };
    }
    if (e.kind === "may") {
      const inner = withAs(e.effect);
      return inner === null ? null : { ...e, effect: inner };
    }
    return null;
  };
  const out = withAs(effect);
  return out === null ? fail() : { effect: out, used: 2 };
}

/**
 * A spell copied and, in the next sentence, "You may choose new targets for
 * the copy" (rule 707.10c) — one `copy-spell` with `newTargets`, or the
 * `may` around it.
 */
function copyNewTargetsAt(sentences, i, ctx) {
  if (!/^you may choose new targets for the copy\.$/i.test(sentences[i + 1] ?? "")) return null;
  const before = ctx.targets.length;
  const effect = parseSentence(sentences[i], ctx);
  const withNew = (e) => {
    if (e?.kind === "copy-spell" && e.newTargets === undefined) return { ...e, newTargets: true };
    if (e?.kind === "may") {
      const inner = withNew(e.effect);
      return inner === null ? null : { ...e, effect: inner };
    }
    return null;
  };
  const out = effect === null || containsUndefined(effect) ? null : withNew(effect);
  if (out === null) {
    ctx.targets.length = before;
    return null;
  }
  return { effect: out, used: 2 };
}

function faceDownAsAt(sentences, i, ctx) {
  const listed = /^(?:it's|they're) (?:an? )?(.+?)\.$/i.exec(sentences[i + 1] ?? "");
  if (listed === null || !/face down/i.test(sentences[i])) return null;
  const words = listed[1].toLowerCase().replace(/creatures$/, "creature");
  const as = FACE_DOWN_AS[words];
  if (as === undefined) return null;
  // "Put any number of cards from your hand onto the battlefield face down."
  const before = ctx.targets.length;
  let effect = /^put any number of cards from your hand onto the battlefield face down\.$/i.test(sentences[i])
    ? { kind: "look-and-choose", zone: "hand", min: 0, max: 99, destination: "battlefield", leftover: "stay", enterAs: { faceDown: true } }
    : parseSentence(sentences[i], ctx);
  // A sentence that isn't one of these leaves no target slot behind for the
  // plain parse that follows.
  const fail = () => {
    ctx.targets.length = before;
    return null;
  };
  if (effect === null || containsUndefined(effect)) return fail();
  const withAs = (e) => {
    if (e.kind === "turn-face-down") return { ...e, as };
    if (e.kind === "put-onto-battlefield" && e.faceDown === true) return { ...e, faceDown: as };
    if (e.kind === "look-and-choose" && e.enterAs?.faceDown === true) return { ...e, enterAs: { ...e.enterAs, faceDown: as } };
    if (e.kind === "may") {
      const inner = withAs(e.effect);
      return inner === null ? null : { ...e, effect: inner };
    }
    return null;
  };
  effect = withAs(effect);
  return effect === null ? fail() : { effect, used: 2 };
}

function itOf(triggers) {
  // "That Vehicle" / "that Mount" (read as "it"): the permanent crewed or
  // saddled, the trigger object.
  if (triggers.every((t) => t.on === "crews-or-saddles")) return "trigger-object";
  // "That creature": what the damage was dealt to.
  if (triggers.every((t) => t.on === "deals-damage" && t.to === "creature")) return "trigger-recipient";
  const objectEvents = ["enters-battlefield", "dies", "attacks", "blocks", "becomes-blocked", "deals-combat-damage-to-player", "tapped-for-mana"];
  if (triggers.every((t) => t.who === "self" && objectEvents.includes(t.on))) return "source";
  // The permanent a spell or ability targeted ("that creature" — Monk Gyatso).
  const othersEvents = [...objectEvents, "becomes-target"];
  if (triggers.every((t) => t.who !== "self" && t.filter !== undefined && othersEvents.includes(t.on))) return "trigger-object";
  // "Whenever equipped creature becomes blocked, it …" (Trailblazer's Torch).
  if (triggers.every((t) => t.who === "attached" && t.on === "becomes-blocked")) return "trigger-object";
  return undefined;
}

/**
 * The permanent a leaves-the-battlefield trigger is about, for "put its
 * counters on …" (rule 122.8): the ability's own source when it's "this"
 * one, the trigger object when it's one the trigger names — "this creature
 * or another" too, whose self half has the source as its trigger object;
 * `undefined` for any other trigger.
 */
function departedOf(triggers) {
  const leaving = ["dies", "leaves-battlefield"];
  if (!triggers.every((t) => leaving.includes(t.on))) return undefined;
  return triggers.every((t) => t.who === "self") ? "source" : "trigger-object";
}

/** Fill `ability.effect` / `targets` from its effect text; a "choose one —"
 * swallows the bullet lines after it. Returns the last line index used. */
/** Effects that move cards to or from a library. */
const LIBRARY_EFFECTS = new Set([
  "draw", "mill", "search-library", "scry", "surveil", "look-and-choose", "put-on-library", "reveal-until",
]);
/** Does an effect deal damage anywhere inside it? */
const dealsDamage = (e) =>
  e !== null && typeof e === "object" &&
  (/^damage/.test(e.kind ?? "") || Object.values(e).some((v) => (Array.isArray(v) ? v.some(dealsDamage) : dealsDamage(v))));
const touchesLibrary = (e) =>
  e !== null && typeof e === "object" &&
  (LIBRARY_EFFECTS.has(e.kind) || Object.values(e).some((v) => (Array.isArray(v) ? v.some(touchesLibrary) : touchesLibrary(v))));

/**
 * "{T}: Add {G}{G}. You gain 2 life." is one mana ability (rule 605.1a):
 * whatever follows the mana rides on `add-mana`'s `also`, since a plain
 * sequence with a non-mana step isn't a mana ability and would use the stack.
 * Only an untargeted ability whose other steps make no mana, and none that
 * moves a card to or from a library: those aren't mana abilities (605.1a —
 * Chromatic Sphere's "Add one mana of any color. Draw a card." uses the
 * stack), and a colour choice made on the stack needs authoring.
 */
function manaAbilityExtras(ability) {
  const e = ability.effect;
  if (e?.kind !== "sequence" || e.effects[0]?.kind !== "add-mana" || ability.targets.length > 0) return;
  const rest = e.effects.slice(1);
  if (rest.length === 0 || rest.some((step) => step.kind === "add-mana")) return;
  // "This land deals 1 damage to you": a pain land's mana ability, the
  // damage part of it (`painToController`).
  if (rest.length === 1 && rest[0].kind === "damage" && rest[0].who === "you" && typeof rest[0].amount === "number") {
    ability.effect = { ...e.effects[0], painToController: rest[0].amount };
    return;
  }
  if (rest.some(touchesLibrary)) {
    ability.__todo = [...(ability.__todo ?? []), "not a mana ability (rule 605.1a: it moves a card to or from a library), so it uses the stack"];
    return;
  }
  ability.effect = { ...e.effects[0], also: rest.length === 1 ? rest[0] : { kind: "sequence", effects: rest } };
}

function fillEffect(ability, text, ctx, lines, i) {
  const modalHead = /^Choose (one|two|one or both|one or more)( that hasn't been chosen( this turn)?)? —$/.exec(text.trim());
  if (modalHead) {
    let j = i + 1;
    const bullets = [];
    while (j < lines.length && lines[j].startsWith("•")) bullets.push(lines[j].replace(/^•\s*/, "")), (j += 1);
    const modes = [];
    let ok = bullets.length > 0;
    for (const b of bullets) {
      // Each mode brings its own targets (rule 700.2b): slots of its own.
      const targets = [];
      const r = parseEffect(b, { targets, tokenFor: ctx.tokenFor, onStack: ctx.onStack });
      if (r.effect === null) ok = false;
      else modes.push({ text: b, ...(targets.length > 0 ? { targets } : {}), effect: r.effect });
    }
    const [min, max] = modeCounts(modalHead[1], bullets.length);
    // A modal ability announces its modes as it goes on the stack — a
    // triggered one (rules 603.3c, 700.2b) or an activated one (602.2b).
    // "That hasn't been chosen" is this object's whole stint; "this turn",
    // this turn's.
    const unchosen = modalHead[2] === undefined ? {} : modalHead[3] !== undefined ? { notChosenThisTurn: true } : { notChosenBefore: true };
    if (ok) ability.effect = { kind: "modal", announced: true, ...unchosen, minModes: min, maxModes: max, modes };
    else ability.__todo = [...(ability.__todo ?? []), `the modes: ${bullets.join(" / ")}`];
    return j - 1;
  }
  // An activated ability's "target … of an opponent's choice" (rules 602.2b,
  // 601.2c); a triggered one has no opponent to name.
  const theirSlots = ability.cost !== undefined && ability.trigger === undefined ? [] : undefined;
  // A divided amount (rules 602.2b, 603.3d, 601.2d): the ability's
  // `divided`, its group the last slot.
  const divided = {};
  // "Target opponent chosen at random" (Witch Hunt): the game picks it as the
  // ability goes on the stack, the slot otherwise as any (`targetsAtRandom`).
  const atRandom = /\btarget\b[^.]*? chosen at random\b/i.exec(text);
  const r = parseEffect(atRandom === null ? text : text.replace(" chosen at random", ""), {
    targets: ability.targets,
    tokenFor: ctx.tokenFor,
    onStack: ctx.onStack,
    it: ctx.it,
    departed: ctx.departed,
    ...(ctx.castSpell === true ? { castSpell: true } : {}),
    divided,
    // A cost that discards one card: "the discarded card" is that card.
    ...(ability.cost?.discard?.count === 1 ? { costDiscarded: true } : {}),
    // A cost that exiles one card: "the exiled card" is that card.
    ...(ability.cost?.exileFromGraveyard?.count === 1 ? { costExiled: true } : {}),
    // A cost that reveals one card: "the revealed card" is that card.
    ...(ability.cost?.reveal?.count === 1 ? { costRevealed: true } : {}),
    // A cost removing all of a kind of counter: how many is the X.
    ...(ability.cost?.removeCounter?.count === "all" ? { removedIsX: true } : {}),
    ...(ctx.thatPlayer !== undefined ? { thatPlayer: ctx.thatPlayer } : {}),
    ...(ctx.attackBatch === true ? { attackBatch: true } : {}),
    ...(theirSlots !== undefined ? { opponentChoosesTargets: theirSlots } : {}),
  });
  if (r.effect !== null && theirSlots !== undefined && theirSlots.length > 0) ability.opponentChoosesTargets = theirSlots;
  if (atRandom !== null && r.effect !== null) ability.targetsAtRandom = true;
  const division = r.effect === null ? undefined : divided.value;
  if (division !== undefined && division.slot !== ability.targets.length - 1) {
    ability.effect = null;
    ability.__todo = [...(ability.__todo ?? []), "a divided amount whose group isn't the last target"];
    return i;
  }
  if (division !== undefined) ability.divided = division;
  ability.effect = r.effect;
  if (r.effect === null) {
    ability.__todo = [...(ability.__todo ?? []), ...r.todo];
    if (r.hints.length > 0) ability.__hint = r.hints;
  }
  return i;
}

const containsTarget = (e) =>
  e !== null && typeof e === "object" && (typeof e.target === "number" || typeof e.b === "number" || Object.values(e).some(containsTarget));

const modeCounts = (head, n) =>
  ({ one: [1, 1], two: [2, 2], "one or both": [1, 2], "one or more": [1, n] })[head];

/** "Choose one —" and its bullets on a spell: a `castModal` (modes may
 * target). `undefined` when the spell isn't modal; `null` when a mode
 * didn't parse. */
function parseModalSpell(spellLines, ctx) {
  // "Choose three. You may choose the same mode more than once." (rule
  // 700.2d — the Confluences): exactly that many, a mode repeatable.
  const repeated = /^Choose (two|three|four|five)\. You may choose the same mode more than once\.$/.exec(spellLines[0].line);
  // "An opponent chooses one —" (rule 700.2e): its modes an opponent's to
  // choose (`castModal.chosenBy`), when they need no targets.
  const theirs = repeated === null ? /^An opponent chooses (one|two|one or both|one or more) —$/.exec(spellLines[0].line) : null;
  const head = repeated ?? theirs ?? /^Choose (one|two|one or both|one or more) —$/.exec(spellLines[0].line);
  if (!head) return undefined;
  const modes = [];
  for (const l of spellLines.slice(1)) {
    if (!l.line.startsWith("•")) return null;
    const text = l.line.replace(/^•\s*/, "");
    const targets = [];
    const r = parseEffect(text, { targets, tokenFor: ctx.tokenFor, onStack: ctx.onStack, spell: ctx.spell });
    if (r.effect === null) return null;
    modes.push({ text: stripReminder(l.raw).replace(/^•\s*/, ""), ...(targets.length ? { targets } : {}), effect: r.effect });
  }
  if (repeated) {
    const n = { two: 2, three: 3, four: 4, five: 5 }[repeated[1]];
    return { castModal: { minModes: n, maxModes: n, repeatModes: true, modes }, effect: null, targets: [] };
  }
  const [minModes, maxModes] = modeCounts(head[1], modes.length);
  if (theirs !== null && modes.some((mode) => mode.targets !== undefined)) return null;
  return { castModal: { minModes, maxModes, ...(theirs !== null ? { chosenBy: "opponent" } : {}), modes }, effect: null, targets: [] };
}

/** Static lines the engine models in one shape. */
const COLOR_WORDS = { white: "W", blue: "U", black: "B", red: "R", green: "G" };

/** A protection grant's qualities, as `grant-protection` reads them. */
const PROTECTION_FROM =
  "(the color of your choice|the card type of your choice|colorless or from the color of your choice|artifacts or from the color of your choice|each color|each of your opponents|everything|instant spells and from sorcery spells|artifacts|creatures|(?:white|blue|black|red|green)(?: and from (?:white|blue|black|red|green))?)";
function protectionFrom(words) {
  const w = words.toLowerCase();
  if (w === "each of your opponents") return { fromPlayers: "opponents" };
  if (w === "everything") return { filter: {} };
  if (w === "instant spells and from sorcery spells") {
    return { filter: { anyOf: [{ isSpell: true, type: "instant" }, { isSpell: true, type: "sorcery" }] } };
  }
  if (w === "the color of your choice") return { choose: "color" };
  if (w === "the card type of your choice") return { choose: "card-type" };
  if (w === "colorless or from the color of your choice") {
    return { choose: "color", or: [{ text: "colorless", from: { filter: { colorless: true } } }] };
  }
  if (w === "artifacts or from the color of your choice") {
    return { choose: "color", or: [{ text: "artifacts", from: { types: ["artifact"] } }] };
  }
  if (w === "each color") return { colors: ["W", "U", "B", "R", "G"] };
  if (w === "artifacts") return { types: ["artifact"] };
  if (w === "creatures") return { types: ["creature"] };
  const colors = w.split(" and from ").map((c) => COLOR_WORDS[c]);
  return colors.every(Boolean) ? { colors } : null;
}
/** "your devotion to [white]( and [black])" — one colour or two (rule 700.5). */
const DEVOTION = "(white|blue|black|red|green)(?: and (white|blue|black|red|green))?";
const devotionColors = (a, b) => [a, b].filter(Boolean).map((w) => COLOR_WORDS[w]);

/** "a nonland card name" → its `CardNameFilter` (rule 201.4a), or null for
 * words it doesn't read: the adjectives before "card name", comma-joined. */
function cardNameFilterOf(words) {
  const w = words.trim().replace(/,$/, "");
  if (w === "") return {};
  if (w === "nonbasic land") return { types: ["land"], nonbasic: true };
  const types = [];
  const notTypes = [];
  for (const part of w.split(/,\s*/)) {
    const t = part.trim();
    if (/^non(artifact|creature|land|enchantment|instant|sorcery|planeswalker)$/.test(t)) notTypes.push(t.slice(3));
    else if (/^(artifact|creature|land|enchantment|instant|sorcery|planeswalker)$/.test(t)) types.push(t);
    else return null;
  }
  return { ...(types.length > 0 ? { types } : {}), ...(notTypes.length > 0 ? { notTypes } : {}) };
}

/**
 * What "~ has all activated abilities of [phrase]" reads, as a
 * `grantsActivatedOf` without its `except`/`only`: "all creature cards in all
 * graveyards", "all Elf cards in your graveyard", "each other creature with a
 * +1/+1 counter on it", "creatures you control that don't have the same name
 * as ~", "all lands your opponents control", "all other planeswalkers on the
 * battlefield". `null` for anything else.
 */
function grantsActivatedOfPhrase(phrase) {
  let m = /^all (.+?) cards in (all graveyards|your graveyard)$/.exec(phrase);
  if (m !== null) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { zone: "graveyard", filter: { ...filter, ...(m[2] === "your graveyard" ? { ownedBy: "you" } : {}) } };
  }
  m = /^(?:all |each )?(?:other )?(.+?)( with an? \+1\/\+1 counter on (?:it|them))?( you control| your opponents control| on the battlefield)?( that don't have the same name as ~)?$/.exec(phrase);
  if (m === null) return null;
  const filter = parseTypePhrase(m[1]);
  if (filter === null || Object.keys(filter).length === 0) return null;
  return {
    zone: "battlefield",
    filter: {
      ...filter,
      ...(m[2] !== undefined ? { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } : {}),
      ...(m[3] === " you control" ? { controlledBy: "you" } : m[3] === " your opponents control" ? { controlledBy: "opponent" } : {}),
      ...(m[4] !== undefined ? { sameNameAsSource: false } : {}),
    },
  };
}

/** What a "can't be the target(s) of …" names, as a `hexproofFrom` with its
 * qualifiers, or `null`: "spells", "[quality] spells", "abilities from
 * [quality] sources", "[quality] spells or abilities from [quality]
 * sources" (one quality, said twice), each with or without "your opponents
 * control" (without it, `anyController`). A quality is colour words joined
 * by "or" ("blue or black"), a card type, or "Aura". */
function untargetablePhrase(phrase) {
  let rest = phrase;
  const opponents = / your opponents control$/.test(rest);
  if (opponents) rest = rest.slice(0, -" your opponents control".length);
  const quality = (words) => {
    if (words === "Aura") return { filter: { subtype: "Aura" } };
    const parts = words.split(/,? or |, /);
    if (parts.every((w) => COLOR_WORDS[w] !== undefined)) return { colors: parts.map((w) => COLOR_WORDS[w]) };
    if (parts.every((w) => /^(artifact|creature|enchantment|land|planeswalker|instant|sorcery)$/.test(w))) return { types: parts };
    return null;
  };
  const owner = opponents ? {} : { anyController: true };
  let m;
  if (rest === "spells") return { spellsOnly: true, ...owner };
  if (rest === "spells or abilities") return { ...owner };
  // "~ can't be the target of abilities your opponents control" (Shanna).
  if (rest === "abilities") return { abilitiesOnly: true, ...owner };
  if ((m = /^abilities from (.+) sources$/.exec(rest)) !== null) {
    const q = quality(m[1]);
    return q === null ? null : { ...q, abilitiesOnly: true, ...owner };
  }
  if ((m = /^(.+) spells or abilities from (.+) sources$/.exec(rest)) !== null) {
    const q = m[1] === m[2] ? quality(m[1]) : null;
    return q === null ? null : { ...q, ...owner };
  }
  if ((m = /^(.+) spells$/.exec(rest)) !== null) {
    const q = quality(m[1]);
    return q === null ? null : { ...q, spellsOnly: true, ...owner };
  }
  return null;
}

/** Whether a parsed static changes types (a layer-4 part), which a granted
 * static may not have (`StaticAbility.grantsStatic`). */
function hasLayerFourPartOf(st) {
  return ["addTypes", "addSubtypes", "setTypes", "setSubtypes", "loseAllCreatureTypes", "setsChosenLandType"].some(
    (k) => st[k] !== undefined,
  );
}

/**
 * A quoted static another static grants (`grantsStatic`), read as a static of
 * the object that has it: any line `parseStatic` reads ("This creature" as
 * ~), and the few shapes only seen quoted — "Creature tokens you control get
 * +2/+2" (Inspiring Leader), "This creature gets +1/+1 as long as you control
 * a Swamp" (Sedge Sliver), "You can't lose the game and your opponents can't
 * win the game" (Cloudsteel Kirin). `null` for anything else.
 */
function parseGrantedStatic(quoted) {
  const own = parseStatic(quoted.replace(/^This creature /, "~ "), quoted);
  if (own !== null) return own;
  let m;
  if ((m = /^Creature tokens you control get ([+-]\d+)\/([+-]\d+)\.$/.exec(quoted))) {
    return { affects: { scope: "creatures-you-control", tokenOnly: true }, grantPt: [Number(m[1]), Number(m[2])], text: quoted };
  }
  if ((m = /^(?:This creature|~) gets ([+-]\d+)\/([+-]\d+) as long as you control an? ([A-Z][a-z]+)\.$/.exec(quoted))) {
    const filter = parseTypePhrase(m[3]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return {
      affects: { scope: "self" },
      condition: { kind: "controls", filter, atLeast: 1 },
      grantPt: [Number(m[1]), Number(m[2])],
      text: quoted,
    };
  }
  if (quoted === "You can't lose the game and your opponents can't win the game.") {
    return { affects: { scope: "self" }, cantLoseGame: true, opponentsCantWinGame: true, text: quoted };
  }
  return null;
}

/** The creature types an outlaw has (rule 700.12). */
const OUTLAW_TYPES = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

/** The keyword abilities a card in a graveyard can be given, with their cost
 * (`GraveyardKeywordGrant`). */
const GRAVEYARD_KEYWORD = "unearth|encore|embalm|harmonize|retrace|sneak";

/**
 * "artifact creature", "Sliver creature", "outlaw creature", "Merfolk and
 * Druid", "Instant and sorcery", "nonland permanent": the cards a grant to a
 * zone reaches, as a filter, with `thats`' "Cleric, Rogue, Warrior, and/or
 * Wizard" read as subtypes. `null` for a phrase the type reader doesn't know.
 */
function grantedCardsFilter(phrase, thats) {
  const lowered = CARD_TYPES.includes(phrase.split(" ")[0].toLowerCase())
    ? phrase[0].toLowerCase() + phrase.slice(1)
    : phrase;
  const both = /^(\S+) and (\S+)$/.exec(lowered);
  let filter;
  if (both !== null && /^[A-Z]/.test(both[1]) && /^[A-Z]/.test(both[2])) filter = { subtypes: [both[1], both[2]] };
  else if (both !== null) filter = parseTypePhrase(`${both[1]} or ${both[2]}`, { cards: true });
  else if (lowered.startsWith("outlaw ")) {
    const rest = parseTypePhrase(lowered.slice("outlaw ".length), { cards: true });
    filter = rest === null ? null : { ...rest, subtypes: OUTLAW_TYPES };
  } else filter = parseTypePhrase(lowered, { cards: true });
  if (filter === null) return null;
  if (thats !== undefined) {
    const names = thats.split(/,? and\/or |, /);
    if (!names.every((n) => /^[A-Z][a-z]+$/.test(n))) return null;
    filter.subtypes = names;
  }
  return filter;
}

/**
 * The statics that reach cards outside the battlefield (rule 604.1): keyword
 * abilities with their cost for cards in your graveyard
 * (`grantsToGraveyard.keywords`) or a hand (`grantsCyclingInHand`,
 * `grantsForetellInHand`), sneak cast from the graveyard
 * (`castWithSneakFromGraveyard`), and types off the battlefield
 * (`typesOutsideBattlefield`). `null` for any other line.
 */
function outsideBattlefieldStaticOf(line, text) {
  let m;
  const self = { affects: { scope: "self" } };
  m = new RegExp(
    `^(During your turn, )?(?:Each (.+?) card|(.+?) cards) in your graveyard(?: that's an? (.+?))? (?:has|have) (${GRAVEYARD_KEYWORD})` +
      "(?: ((?:\\{[^}]+\\})+)(, where X is its mana value)?)?(\\. (?:Its|The) \\w+ cost is equal to its mana cost)?\\.$",
  ).exec(line);
  if (m !== null) {
    const [, duringYourTurn, each, plural, thats, keyword, cost, xIsManaValue, sameAsMana] = m;
    const filter = grantedCardsFilter(each ?? plural, thats);
    if (filter === null || (cost === undefined && sameAsMana === undefined && keyword !== "retrace")) return null;
    const grant = { keyword, ...(cost === undefined ? {} : { cost: xIsManaValue !== undefined ? "mana-value" : cost }) };
    if (xIsManaValue !== undefined && cost !== "{X}") return null;
    return {
      ...self,
      ...(duringYourTurn !== undefined ? { condition: { kind: "your-turn" } } : {}),
      grantsToGraveyard: { filter, keywords: [grant] },
      text,
    };
  }
  if ((m = /^You may cast (\w+) spells from your graveyard using their sneak abilities\.$/.exec(line))) {
    const filter = parseTypePhrase(m[1]);
    return filter === null ? null : { ...self, castWithSneakFromGraveyard: { filter }, text };
  }
  if ((m = /^Each (.+?) card in (your hand|each player's hand) has (\w*)cycling ((?:\{[^}]+\})+)\.$/.exec(line))) {
    const filter = parseTypePhrase(m[1], { cards: true });
    if (filter === null) return null;
    const search = m[3] === "" ? undefined : { subtype: m[3][0].toUpperCase() + m[3].slice(1) };
    return {
      ...self,
      grantsCyclingInHand: {
        cost: m[4],
        filter,
        ...(search !== undefined ? { search } : {}),
        ...(m[2] === "each player's hand" ? { eachPlayer: true } : {}),
      },
      text,
    };
  }
  if ((m = /^Each nonland card in your hand without foretell has foretell\. Its foretell cost is equal to its mana cost reduced by \{(\d+)\}\.$/.exec(line))) {
    return { ...self, grantsForetellInHand: { filter: { notTypes: ["land"] }, reducedBy: Number(m[1]) }, text };
  }
  if (line === "Each creature card in your graveyard has the chosen creature type in addition to its other types.") {
    return {
      ...self,
      typesOutsideBattlefield: { ofType: "creature", zones: ["graveyard"], addsChosenCreatureType: true },
      text,
    };
  }
  if ((m = /^Creatures you control are (the chosen type|every creature type|artifacts|[A-Z][a-z]+s)( in addition to their other types)?\. The same is true for creature spells you control and creature cards you own that aren't on the battlefield\.$/.exec(line))) {
    const addition = m[2] !== undefined;
    let part;
    if (m[1] === "the chosen type") part = addition ? { addsChosenCreatureType: true } : { setsChosenCreatureType: true };
    else if (m[1] === "every creature type") part = { addSubtypes: ["(every creature type)"] };
    else if (!addition) return null;
    else if (m[1] === "artifacts") part = { addTypes: ["artifact"] };
    else part = { addSubtypes: [singular(m[1])] };
    return {
      affects: { scope: "creatures-you-control" },
      ...part,
      typesOutsideBattlefield: { ofType: "creature", ...part },
      text,
    };
  }
  if ((m = /^Lands you control and land cards you own that aren't on the battlefield are ([A-Z][a-z]+s) in addition to their other types\.$/.exec(line))) {
    const part = { addSubtypes: [singular(m[1])] };
    return {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      ...part,
      typesOutsideBattlefield: { ofType: "land", ...part },
      text,
    };
  }
  return null;
}

/**
 * A P/T bonus scaled by what the affected permanent itself has or by an amount
 * read off the board or the turn (`grantPtPerCount`'s `relativeToAffected`,
 * `sharesCreatureTypeWithAffected`, `ofAffected`, `playerCountersOf`,
 * `anyCountersOnSource`, `turnStat`, `basicLandTypes`, `step`,
 * `fromAffectedController`). `null` for any other line.
 */
function perAmountStaticOf(line, text) {
  let m;
  const subjectOf = (subject) =>
    subject === "~"
      ? { scope: "self" }
      : subject === "Equipped creature" || subject === "Enchanted creature"
        ? { scope: "attached" }
        : subject === "Creatures you control"
          ? { scope: "creatures-you-control" }
          : subject === "Each creature"
            ? { scope: "all-creatures" }
            : null;
  const P = "(~|Equipped creature|Enchanted creature|Creatures you control|Each creature) gets? ";
  const pair = (a, b) => [Number(a), Number(b)];
  // "… for each Aura and Equipment attached to it": on the subject itself, or
  // on the permanent an Aura or Equipment is attached to.
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each (Aura and Equipment|Aura|Equipment) attached to (?:it|~)\\.$`).exec(line))) {
    const kinds = m[4] === "Aura and Equipment" ? { subtypes: ["Aura", "Equipment"] } : { subtype: m[4] };
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: {
        filter: { ...kinds, attachedTo: { isSource: true } },
        ...(m[1] === "~" ? {} : { relativeToAffected: true }),
        pt: pair(m[2], m[3]),
      },
      text,
    };
  }
  // Strata Scythe: every player's lands, named like the card linked to this one.
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each (.+?) on the battlefield with the same name as the exiled card\\.$`).exec(line))) {
    const filter = parseTypePhrase(m[4]);
    if (filter === null) return null;
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: { filter: { ...filter, sameNameWith: "exiled-with-source" }, pt: pair(m[2], m[3]) },
      text,
    };
  }
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each other creature on the battlefield that shares (?:at least one|a) creature type with it\\.$`).exec(line))) {
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: {
        filter: { type: "creature" },
        sharesCreatureTypeWithAffected: true,
        relativeToAffected: true,
        excludeSelf: true,
        pt: pair(m[2], m[3]),
      },
      text,
    };
  }
  if ((m = /^All (\w+) creatures get ([+-]\d+)\/([+-]\d+) for each other \1 on the battlefield\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { type: "creature", subtype: m[1] } },
      grantPtPerCount: { filter: { subtype: m[1] }, relativeToAffected: true, excludeSelf: true, pt: pair(m[2], m[3]) },
      text,
    };
  }
  if ((m = new RegExp(`^${P}\\+X/\\+(X|0), where X is its mana value\\.$`).exec(line))) {
    return { affects: subjectOf(m[1]), grantPtPerCount: { ofAffected: "mana-value", pt: [1, m[2] === "X" ? 1 : 0] }, text };
  }
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each of its colors\\.$`).exec(line))) {
    return { affects: subjectOf(m[1]), grantPtPerCount: { ofAffected: "colors", pt: pair(m[2], m[3]) }, text };
  }
  if ((m = /^Each other multicolored creature you control gets ([+-]\d+)\/([+-]\d+) for each of its colors\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", multicolored: true }, excludeSelf: true },
      grantPtPerCount: { ofAffected: "colors", pt: pair(m[1], m[2]) },
      text,
    };
  }
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each (\\w+) counter your opponents have\\.$`).exec(line))) {
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: { playerCounters: m[4], playerCountersOf: "opponents", pt: pair(m[2], m[3]) },
      text,
    };
  }
  if ((m = /^Other ([A-Z][a-z]+)s you control get ([+-]\d+)\/([+-]\d+) for each counter on ~\.$/.exec(line))) {
    return {
      affects: { scope: "creatures-you-control", subtype: m[1], excludeSelf: true },
      grantPtPerCount: { anyCountersOnSource: true, pt: pair(m[2], m[3]) },
      text,
    };
  }
  if ((m = new RegExp(`^${P}\\+X/\\+(X|0), where X is the number of cards you've drawn this turn\\.$`).exec(line))) {
    return { affects: subjectOf(m[1]), grantPtPerCount: { turnStat: "cards-drawn", pt: [1, m[2] === "X" ? 1 : 0] }, text };
  }
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for each basic land type among lands you control\\.$`).exec(line))) {
    return { affects: subjectOf(m[1]), grantPtPerCount: { basicLandTypes: true, pt: pair(m[2], m[3]) }, text };
  }
  if ((m = new RegExp(`^${P}([+-]\\d+)/([+-]\\d+) for every (\\w+) cards in your graveyard\\.$`).exec(line))) {
    const step = numberOf(m[4]);
    if (typeof step !== "number") return null;
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, step, pt: pair(m[2], m[3]) },
      text,
    };
  }
  if ((m = new RegExp(`^${P}-X/-(X|0), where X is the number of cards in its controller's graveyard\\.$`).exec(line))) {
    return {
      affects: subjectOf(m[1]),
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, fromAffectedController: true, pt: [-1, m[2] === "X" ? -1 : 0] },
      text,
    };
  }
  return null;
}

/** An attack tax's sentence: who it guards, the {N} or {X}, what "each" says,
 * and {X}'s count. */
const ATTACK_TAX_LINE =
  /^(?:Domain — )?Creatures can't attack (you|you or planeswalkers you control|planeswalkers you control) unless their controller pays \{(\d+|X)\} for each (of those creatures|creature they control that's attacking (?:you|a planeswalker you control))(?:, where X is the number of (.+?))?\.$/;

/** The `covers` of an attack tax guarding `guards`, when what the sentence
 * charges for says the same; `null` otherwise. */
function attackTaxCovers(guards, each) {
  const covers = { you: "you", "you or planeswalkers you control": "you-and-planeswalkers", "planeswalkers you control": "planeswalkers" }[guards];
  if (each === "of those creatures") return covers;
  const named = each.endsWith("attacking you") ? "you" : "planeswalkers";
  return named === covers ? covers : null;
}

/** The live count "the number of …" names, for an attack tax's {X}: permanents
 * you control, or basic land types among lands you control; `null` for any
 * other (or for an {N} with no such clause). */
function attackTaxCount(phrase) {
  if (phrase === undefined) return null;
  if (phrase === "basic land types among lands you control") return { basicLandTypes: "you" };
  const m = /^(.+?) you control$/.exec(phrase);
  const filter = m === null ? null : parseTypePhrase(m[1]);
  return filter === null || Object.keys(filter).length === 0 ? null : { countOf: { ...filter, controlledBy: "you" } };
}

/** The creatures a "can't attack you" names, as a filter: all of them, by
 * colour, by power, without flying, of the chosen colour; `null` for any other
 * subject. */
function attackingCreatures(subject) {
  const COLORS = { white: "W", blue: "U", black: "B", red: "R", green: "G" };
  if (subject === "Creatures") return { type: "creature" };
  let m;
  if ((m = /^(Non)?(white|blue|black|red|green) creatures$/i.exec(subject))) {
    const color = COLORS[m[2].toLowerCase()];
    return { type: "creature", ...(m[1] === undefined ? { colors: [color] } : { notColors: [color] }) };
  }
  if ((m = /^Creatures with power (\d+) or (less|greater)$/.exec(subject))) {
    return { type: "creature", power: { op: m[2] === "less" ? "lte" : "gte", n: Number(m[1]) } };
  }
  if (subject === "Creatures without flying") return { type: "creature", notKeyword: "flying" };
  if (subject === "Creatures of the chosen color without flying") {
    return { type: "creature", ofChosenColor: true, notKeyword: "flying" };
  }
  return null;
}

/** A `CostReductionAmount`'s "for each …", or null for one the engine has no
 * count for. */
function costEachAmount(phrase) {
  const fixed = {
    "color among permanents you control": { colorsAmong: { controlledBy: "you" } },
    "counter among players and permanents": { allCounters: true },
    "creature attacking you": { countOf: { type: "creature", attackingYou: true } },
    "creature that died this turn": { turnHistory: "died", who: "any-player", filter: { type: "creature" } },
    "permanent sacrificed this turn": { turnHistory: "sacrificed", who: "any-player" },
    "card type among permanents you've sacrificed this turn": { turnHistory: "sacrificed", cardTypes: true },
    "{E} you've paid or lost this turn": { turnStat: "energy-paid-or-lost", who: "you" },
    "basic land type among lands you control": { basicLandTypes: "you" },
  }[phrase];
  if (fixed !== undefined) return fixed;
  let m;
  if ((m = /^(.+?) you control and each (.+?) card in your graveyard$/.exec(phrase))) {
    const here = parseTypePhrase(m[1]);
    const there = parseTypePhrase(m[2]);
    if (here === null || there === null) return null;
    return { sum: [{ countOf: { ...here, controlledBy: "you" } }, { cardsInGraveyard: there }] };
  }
  if ((m = /^(other )?(?:(white|blue|black|red|green) )?(.+?) you control$/.exec(phrase))) {
    const filter = parseTypePhrase(m[3]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    const color = { white: "W", blue: "U", black: "B", red: "R", green: "G" }[m[2]];
    return {
      countOf: { ...filter, ...(color !== undefined ? { colors: [color] } : {}), controlledBy: "you" },
      ...(m[1] !== undefined ? { excludeSelf: true } : {}),
    };
  }
  return null;
}

/** An amount of mana in a cost line, parted as a reduction takes it. */
function costLessParts(cost) {
  const pips = cost.match(/\{[^}]+\}/g) ?? [];
  let generic = 0;
  let colored = "";
  for (const pip of pips) {
    if (/^\{\d+\}$/.test(pip)) generic += Number(pip.slice(1, -1));
    else if (/^\{[WUBRG]\}$/.test(pip)) colored += pip;
    else return null;
  }
  return { generic, colored };
}

/** The condition of "~ costs … less to cast if …", or null. */
function costIfCondition(phrase) {
  const count = (word) => NUMBERS[word];
  let m;
  if ((m = /^you control an? (.+)$/.exec(phrase))) {
    const filter = parseTypePhrase(m[1]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { kind: "controls", filter, atLeast: 1 };
  }
  if ((m = /^an opponent cast (\w+) or more spells this turn$/.exec(phrase)) && count(m[1]) !== undefined) {
    return { kind: "turn-stat", stat: "spells-cast", who: "opponent", atLeast: count(m[1]) };
  }
  if ((m = /^an opponent has drawn (\w+) or more cards this turn$/.exec(phrase)) && count(m[1]) !== undefined) {
    return { kind: "turn-stat", stat: "cards-drawn", who: "opponent", atLeast: count(m[1]) };
  }
  if (phrase === "you've cast an instant or sorcery spell this turn") {
    return { kind: "cast-this-turn", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } };
  }
  return null;
}

/** The card fields of one line that changes what a spell itself costs, or null. */
function selfCostLine(line) {
  const always = { kind: "controls", filter: {}, atLeast: 0 };
  const reducing = (cost, condition, each) => {
    const parts = costLessParts(cost);
    if (parts === null) return null;
    const { generic, colored } = parts;
    if (each === undefined) {
      return {
        condition,
        ...(generic > 0 ? { reduceGeneric: generic } : {}),
        ...(colored !== "" ? { reduceColored: colored } : {}),
      };
    }
    if (colored !== "" && generic > 0) return null;
    if (colored !== "") return { condition, reduceColored: colored, reduceColoredTimes: each };
    if (generic === 1) return { condition, reduceGeneric: each };
    return {
      condition,
      reduceGeneric: "turnHistory" in each ? { ...each, times: generic } : { scaled: each, by: generic },
    };
  };
  let m;
  // "… {N} more … if it targets …" and "… less … if it targets …".
  if ((m = /^~ costs \{(\d+)\} more to cast if it targets an? (.+)\.$/.exec(line))) {
    const filter = parseTypePhrase(m[2]);
    if (filter === null || Object.keys(filter).length === 0) return null;
    return { targetCostIncrease: { filter, increaseGeneric: Number(m[1]) } };
  }
  if ((m = /^~ costs ((?:\{[^}]+\})+) less to cast if it targets an? (instant or sorcery spell)\.$/.exec(line))) {
    const parts = costLessParts(m[1]);
    if (parts === null) return null;
    return {
      targetCostReduction: {
        filter: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: parts.generic,
        ...(parts.colored !== "" ? { reduceColored: parts.colored } : {}),
      },
    };
  }
  // Two independent conditions, in one sentence or two (Assassin's Ink,
  // Geistlight Snare).
  if ((m = /^~ costs ((?:\{[^}]+\})+) less to cast if (.+?)(?: and|\. It also costs) ((?:\{[^}]+\})+) less to cast if (.+)\.$/.exec(line))) {
    const first = costIfCondition(m[2]);
    const second = costIfCondition(m[4]);
    if (first === null || second === null) return null;
    const both = [reducing(m[1], first), reducing(m[3], second)];
    return both.includes(null) ? null : { selfCostReduction: both };
  }
  if ((m = /^~ costs ((?:\{[^}]+\})+) less to cast if (.+)\.$/.exec(line))) {
    const condition = costIfCondition(m[2]);
    if (condition === null) return null;
    const one = reducing(m[1], condition);
    return one === null ? null : { selfCostReduction: one };
  }
  if ((m = /^During your turn, ~ costs ((?:\{[^}]+\})+) less to cast\.$/.exec(line))) {
    const one = reducing(m[1], { kind: "your-turn" });
    return one === null ? null : { selfCostReduction: one };
  }
  if ((m = /^~ costs ((?:\{[^}]+\})+) less to cast for each (.+)\.$/.exec(line))) {
    const each = costEachAmount(m[2]);
    if (each === null) return null;
    const one = reducing(m[1], always, each);
    return one === null ? null : { selfCostReduction: one };
  }
  return null;
}

/** "Spells … cost … to cast" statics keyed to the spell's targets or to where
 * it's cast from, or read off the spell or its source (`costModification`),
 * or null. */
function spellCostStaticOf(line, text) {
  const made = (costModification) => ({ affects: { scope: "self" }, costModification, text });
  let m;
  if ((m = /^(White|Blue|Black|Red|Green) spells you cast cost ((?:\{[WUBRG]\})+) more to cast\.$/.exec(line))) {
    return made({ applies: { colors: [COLOR_WORD[m[1].toLowerCase()]] }, caster: "you", increaseColored: m[2] });
  }
  if ((m = /^Spells you cast that target an? (.+?) cost \{(\d+)\} less to cast\.$/.exec(line))) {
    const targeting = parseTypePhrase(m[1]);
    if (targeting === null || Object.keys(targeting).length === 0) return null;
    return made({ applies: {}, caster: "you", targeting, reduceGeneric: Number(m[2]) });
  }
  if ((m = /^Spells that target (?:~|this creature|this permanent) cost \{(\d+)\} less to cast\.$/.exec(line))) {
    return made({ applies: {}, targetingSource: true, reduceGeneric: Number(m[1]) });
  }
  if ((m = /^Each instant and sorcery spell you cast costs \{(\d+)\} less to cast for each (\w+) it targets\.$/.exec(line))) {
    const targeting = parseTypePhrase(m[2]);
    if (targeting === null) return null;
    return made({
      applies: { typesAnyOf: ["instant", "sorcery"] },
      caster: "you",
      perTarget: true,
      targeting,
      reduceGeneric: Number(m[1]),
    });
  }
  if ((m = /^Spells you cast cost \{(\d+)\} less to cast for each card with the same name as that spell in your graveyard\.$/.exec(line))) {
    const each = { cardsInGraveyard: {}, sameNameAsSpell: true };
    return made({ applies: {}, caster: "you", reduceGeneric: m[1] === "1" ? each : { scaled: each, by: Number(m[1]) } });
  }
  if ((m = /^Spells you cast from your graveyard cost \{(\d+)\} less to cast\.$/.exec(line))) {
    return made({ applies: {}, caster: "you", castFrom: "graveyard", reduceGeneric: Number(m[1]) });
  }
  if ((m = /^Spells your opponents cast from graveyards or from exile cost \{(\d+)\} more to cast\.$/.exec(line))) {
    return made({ applies: {}, caster: "opponent", castFrom: ["graveyard", "exile"], castFromAnyones: true, increaseGeneric: Number(m[1]) });
  }
  if ((m = /^(Instant and sorcery|Aura and Equipment) spells you cast(?: with mana value (\d+) or greater)? cost \{X\} less to cast, where X is (~|this creature|equipped creature)'s power\.$/.exec(line))) {
    const applies = m[1] === "Instant and sorcery" ? { typesAnyOf: ["instant", "sorcery"] } : { subtypes: ["Aura", "Equipment"] };
    return made({
      applies: { ...applies, ...(m[2] !== undefined ? { manaValue: { op: "gte", n: Number(m[2]) } } : {}) },
      caster: "you",
      reduceGeneric: { powerOf: m[3] === "equipped creature" ? "attached" : "source" },
    });
  }
  return null;
}

/**
 * A `would-create-token` replacement (`TokenMultiplierReplacement`): "those
 * tokens plus an additional Food token" (Tippy-Toe), plus that many
 * (Chatterfang), that many of another token instead (Draconic Visitor),
 * another token instead (Fisher's Talent), one of each (Academy Manufactor).
 * Not one the player may choose ("you may instead"), which no template reads.
 */
function tokenReplacementOf(line, text, tokenFor) {
  const static_ = (replacement) => ({ affects: { scope: "self" }, replacement: { event: "would-create-token", ...replacement }, text });
  // "artifact tokens" names a type, "Treasure tokens" a subtype.
  const of = (word) => {
    if (word === undefined || word === "") return {};
    const w = word.trim();
    if (["artifact", "creature", "enchantment"].includes(w)) return { ofTokens: { type: w } };
    return /^[A-Z][a-z]+$/.test(w) ? { ofTokens: { subtypesAnyOf: [w] } } : null;
  };
  let m;
  // "If you would create a Clue, Food, or Treasure token, instead create one of each."
  if ((m = /^If you would create a (\w+), (\w+), or (\w+) token, instead create one of each\.$/.exec(line))) {
    const kinds = [m[1], m[2], m[3]];
    const names = kinds.map((k) => tokenFor(k));
    if (names.some((n) => n === null)) return null;
    return static_({ oneOfEach: names, ofTokens: { subtypesAnyOf: kinds } });
  }
  // "If you would create a Fish token, create a 3/3 blue Shark creature token instead."
  if ((m = /^If you would create an? (\w+) token, create an? ([^"“]+?) token instead\.$/.exec(line))) {
    const name = tokenFor(m[2]);
    const ofTokens = of(m[1]);
    return name === null || ofTokens === null ? null : static_({ tokensInstead: name, ...ofTokens });
  }
  m =
    /^If you would create one or more (?:(\w+) )?tokens, instead create those tokens plus (an additional|that many) ([^"“]+?) tokens?(?: with ([^"“]+?))?\.$/.exec(line) ??
    /^If one or more (?:(\w+) )?tokens would be created under your control, those tokens plus (an additional|an?|that many) ([^"“]+?) tokens?(?: with ([^"“]+?))? are created instead\.$/.exec(line);
  if (m !== null) {
    const name = tokenFor(`${m[3]}${m[4] ? ` with ${m[4]}` : ""}`);
    const ofTokens = of(m[1]);
    if (name === null || ofTokens === null) return null;
    return static_({ ...(m[2] === "that many" ? { plusTokens: name } : { plusOneToken: name }), ...ofTokens });
  }
  // "… that many 5/5 red Dragon creature tokens with flying are created instead."
  if ((m = /^If one or more (\w+) tokens would be created under your control, that many ([^"“]+?) tokens?(?: with ([^"“]+?))? are created instead\.$/.exec(line))) {
    const name = tokenFor(`${m[2]}${m[3] ? ` with ${m[3]}` : ""}`);
    if (name === null) return null;
    if (m[1] === "creature") return static_({ creatureTokensInstead: name });
    const ofTokens = of(m[1]);
    return ofTokens === null ? null : static_({ tokensInstead: name, ...ofTokens });
  }
  return null;
}

/** A would-draw replacement's look or reveal at the top N cards, one (or
 * every card of a type) into your hand and the rest into your graveyard or
 * onto the bottom in any order: Underrealm Lich, Tomorrow, Azami's Familiar,
 * Sages of the Anima. `null` for any other effect. */
function drawInsteadLookOf(sentence) {
  const m =
    /^(Look at|Reveal) the top (\w+) cards of your library(?:, then|\.) [Pp]ut (one|all (.+?) cards revealed this way)(?: of (?:them|those cards))? into your hand and the rest (into your graveyard|on the bottom of your library in any order)\.$/.exec(
      sentence,
    );
  if (m === null) return null;
  const count = NUMBERS[m[2]];
  if (count === undefined) return null;
  const filter = m[4] !== undefined ? parseTypePhrase(m[4]) : undefined;
  if (filter === null) return null;
  const every = m[3].startsWith("all");
  return {
    kind: "look-and-choose",
    zone: "library",
    count,
    ...(m[1] === "Reveal" ? { reveal: true } : {}),
    min: every ? count : 1,
    max: every ? count : 1,
    ...(filter !== undefined ? { filter } : {}),
    destination: "hand",
    leftover: m[5] === "into your graveyard" ? "graveyard" : "bottom-any-order",
  };
}

/**
 * A permanent that's a creature on its own terms, in the planeswalkers' words:
 * "During your turn, ~ is a 4/4 Human Soldier creature with indestructible
 * that's still a planeswalker" (Gideon Blackblade), "As long as ~ has seven or
 * more loyalty counters on him, he's a 7/7 Dragon God creature with flying and
 * indestructible" (Grand Master of Flowers), "During your turn, as long as ~
 * has one or more loyalty counters on him, he's a 3/4 Ninja creature and has
 * hexproof" (Kaito). "Still a [type]" keeps its card types (rule 205.1b), and
 * without those words the new type replaces them (205.1a).
 */
function selfCreatureWhileOf(line, text) {
  const m =
    /^(During your turn, )?(?:[Aa]s long as ~ has (\w+) or more (\w+) counters on (?:him|her|it), )?(?:~ is|he's|she's|it's) an? (\d+)\/(\d+) ((?:[A-Z][a-z]+ )+)creature(?:(?: with| and has) ([a-z ,]+?))?( that's still an? [a-z]+)?\.$/.exec(
      line,
    );
  if (m === null || (m[1] === undefined && m[2] === undefined)) return null;
  const keywords = [];
  for (const word of (m[7] ?? "").split(/, and |, | and /).filter(Boolean)) {
    const keyword = KEYWORDS[word];
    if (keyword === undefined) return null;
    keywords.push(keyword);
  }
  const counters =
    m[2] === undefined
      ? null
      : { kind: "self-counters", counter: m[3], compare: { op: "gte", n: numberOf(m[2]) } };
  const during = m[1] !== undefined ? { kind: "your-turn" } : null;
  const condition = during !== null && counters !== null ? { kind: "all", of: [during, counters] } : (during ?? counters);
  return {
    affects: { scope: "self" },
    condition,
    ...(m[8] !== undefined ? { addTypes: ["creature"] } : { setTypes: ["creature"] }),
    addSubtypes: m[6].trim().split(" "),
    setBasePt: { power: Number(m[4]), toughness: Number(m[5]) },
    ...(keywords.length > 0 ? { grantKeywords: keywords } : {}),
    text,
  };
}

function parseStatic(line, text) {
  const spellCost = spellCostStaticOf(line, text);
  if (spellCost !== null) return spellCost;
  const creatureWhile = selfCreatureWhileOf(line, text);
  if (creatureWhile !== null) return creatureWhile;
  // Spark Rupture: every such planeswalker, each P/T its own count (layer 7b).
  {
    const m =
      /^Each planeswalker with (\w+) or more loyalty counters on it loses all abilities and is a creature with power and toughness each equal to the number of loyalty counters on it\.$/.exec(
        line,
      );
    if (m !== null) {
      return {
        affects: {
          scope: "filter",
          filter: { type: "planeswalker", counters: { kind: "loyalty", compare: { op: "gte", n: numberOf(m[1]) } } },
        },
        loseAllAbilities: true,
        setTypes: ["creature"],
        setBasePtFromAffectedCounters: "loyalty",
        text,
      };
    }
  }
  // A limit on how many creatures attack or block (`combat/limits.ts`): "No more
  // than two creatures can attack you each combat" (Crawlspace), "… attack each
  // combat", "… block each combat" (Silent Arbiter), "… attack ~" (The Eternal
  // Wanderer), "this planeswalker" as a quoted grant (Tomik), and "As long as ~
  // is tapped, …" (Mirri).
  const limit =
    /^(As long as ~ is tapped, n|N)o more than (one|two|three) creatures? can (attack|block)( you| ~| this planeswalker)? each combat\.$/.exec(line);
  if (limit !== null && !(limit[3] === "block" && limit[4] !== undefined)) {
    const most = { one: 1, two: 2, three: 3 }[limit[2]];
    const covers = limit[4] === undefined ? "all" : limit[4] === " you" ? "you" : "self";
    return {
      affects: { scope: "self" },
      ...(limit[1].length > 1 ? { condition: { kind: "source", filter: { tapped: true } } } : {}),
      ...(limit[3] === "attack" ? { attackLimit: { most, covers } } : { blockLimit: { most } }),
      text,
    };
  }
  // Casting and activation rules with one reading each.
  const fixed = {
    "Each opponent can cast spells only any time they could cast a sorcery.": { prohibits: { who: "opponents", castOnlyAsSorcery: true } },
    "You may activate abilities of creatures you control as though those creatures had haste.": { activateAsThoughHaste: { type: "creature" } },
    "You may activate the loyalty abilities of planeswalkers you control twice each turn rather than only once.": { loyaltyActivationsEachTurn: 2 },
    "Players can't activate planeswalkers' loyalty abilities.": {
      prohibits: { who: "each-player", abilitiesOf: { type: "planeswalker" }, onlyLoyaltyAbilities: true },
    },
    "Enchanted player can't activate abilities that aren't mana abilities or loyalty abilities.": {
      prohibits: { who: "enchanted-player", abilitiesOf: {}, anyZone: true, exceptManaAbilities: true, exceptLoyaltyAbilities: true },
    },
  }[line];
  if (fixed !== undefined) return { affects: { scope: "self" }, ...fixed, text };
  let m;
  // "You may play lands and cast spells from among cards exiled with ~ [. If you
  // cast a spell this way, you may spend mana as though it were mana of any
  // color to cast it.]" (Nightveil Specter, Intellect Devourer), "You may cast
  // spells from among cards exiled with ~." (Rona): rule 607.2a, the ability of
  // whoever controls it, for this stint's cards.
  if ((m = /^You may (play lands and )?cast spells from among cards exiled with ~\.( If you cast a spell this way, you may spend mana as though it were mana of any color to cast it\.)?$/.exec(line))) {
    return {
      affects: { scope: "self" },
      playFromExile: {
        filter: {},
        linked: true,
        ...(m[1] === undefined ? { castOnly: true } : {}),
        ...(m[2] !== undefined ? { spendAs: "any-color" } : {}),
      },
      text,
    };
  }
  // A cycling cost's alternative (rule 702.29f has typecycling's a cycling
  // cost too): Gavi, Nest Warden, New Perspectives.
  if (line === "You may pay {0} rather than pay the cycling cost of the first card you cycle each turn.") {
    return { affects: { scope: "self" }, alternativeCyclingCost: { mana: "{0}", firstEachTurn: true }, text };
  }
  if ((m = /^As long as you have (\w+) or more cards in hand, you may pay (\{\d+\}) rather than pay cycling costs\.$/.exec(line))) {
    const atLeast = NUMBERS[m[1].toLowerCase()];
    if (atLeast !== undefined) {
      return {
        affects: { scope: "self" },
        condition: { kind: "hand-size", atLeast },
        alternativeCyclingCost: { mana: m[2] },
        text,
      };
    }
  }
  // A free cast by an alternative cost (rule 118.9), with its limits.
  if (line === "You may cast spells from your hand without paying their mana costs.") {
    return { affects: { scope: "self" }, alternativeCostForSpells: { mana: "{0}", fromHand: true }, text };
  }
  if (line === "You may cast spells with mana value less than or equal to the number of creatures you control from your hand without paying their mana costs.") {
    return {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        fromHand: true,
        filter: { manaValue: { op: "lte", n: { amount: { countOf: { type: "creature", controlledBy: "you" } } } } },
      },
      text,
    };
  }
  if ((m = /^Any player may cast (\w+) spells with mana value (\d+) or less without paying their mana costs and as though they had flash\.$/.exec(line))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null && Object.keys(filter).length > 0) {
      return {
        affects: { scope: "self" },
        alternativeCostForSpells: {
          mana: "{0}",
          anyPlayer: true,
          flash: true,
          filter: { ...filter, manaValue: { op: "lte", n: Number(m[2]) } },
        },
        text,
      };
    }
  }
  // "Once during each of your turns, you may cast an instant or sorcery spell
  // from your hand without paying its mana cost" (Zaffai and the Tempests), "a
  // spell from your hand or the top of your library" (One with the Multiverse).
  if ((m = /^Once during each of your turns, you may cast (?:an? (.+?) spell|a spell) from your hand( or the top of your library)? without paying its mana cost\.$/.exec(line))) {
    const filter = m[1] === undefined ? {} : parseTypePhrase(m[1]);
    if (filter !== null && (m[1] === undefined || Object.keys(filter).length > 0)) {
      return {
        affects: { scope: "self" },
        alternativeCostForSpells: {
          mana: "{0}",
          oncePerTurn: true,
          yourTurnOnly: true,
          fromHand: true,
          ...(m[2] !== undefined ? { fromZones: ["library"] } : {}),
          ...(m[1] !== undefined ? { filter } : {}),
        },
        text,
      };
    }
  }
  // "Once each turn, you may pay {0} rather than pay the mana cost for a
  // creature spell you cast from exile" (Tlincalli Hunter), "… for a spell you
  // cast with mana value X or less, where X is the number of time counters on
  // this enchantment" (As Foretold).
  if ((m = /^Once each turn, you may pay \{0\} rather than pay the mana cost for an? (.+?) spell you cast from exile\.$/.exec(line))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null && Object.keys(filter).length > 0) {
      return {
        affects: { scope: "self" },
        alternativeCostForSpells: { mana: "{0}", oncePerTurn: true, fromZones: ["exile"], filter },
        text,
      };
    }
  }
  if ((m = /^Once each turn, you may pay \{0\} rather than pay the mana cost for a spell you cast with mana value X or less, where X is the number of (\w+) counters on (?:~|this \w+)\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      alternativeCostForSpells: {
        mana: "{0}",
        oncePerTurn: true,
        filter: { manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: m[1] } } } },
      },
      text,
    };
  }
  // "~ has hexproof as long as it hasn't dealt damage yet." (Karakyk Guardian),
  // "… as long as they haven't dealt combat damage yet" (Ruric Thar).
  if ((m = /^~ has (\w+) as long as (?:it hasn't|they haven't) dealt (combat )?damage yet\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      condition: { kind: "self-hasnt-dealt-damage", ...(m[2] !== undefined ? { combat: true } : {}) },
      grantKeywords: [m[1]],
      text,
    };
  }
  // Life equal to the mana value for a spell, once a turn (rule 118.9):
  // "Once during each of your turns, you may cast an enchantment spell by
  // paying life equal to its mana value rather than paying its mana cost"
  // (Demon of Fate's Design), "… a spell from your hand …" (Access Maze).
  if ((m = /^Once during each of your turns, you may cast (?:an? (.+?) spell|a spell from your hand) by paying life equal to its mana value rather than paying its mana cost\.$/.exec(line))) {
    const filter = m[1] === undefined ? {} : parseTypePhrase(m[1]);
    if (filter !== null && (m[1] === undefined || Object.keys(filter).length > 0)) {
      return {
        affects: { scope: "self" },
        alternativeCostForSpells: {
          mana: "{0}",
          ...(m[1] === undefined ? { fromHand: true } : { filter }),
          payLifeManaValue: true,
          oncePerTurn: true,
          yourTurnOnly: true,
        },
        text,
      };
    }
  }
  // A cost keyed to a spell's target (`targetedBySpellsCost`, rule 601.2f):
  // "Spells your opponents cast that target this creature cost {2} more to
  // cast" (Boreal Elemental), "… an additional 3 life" (Terror of the Peaks),
  // "… a Merfolk you control", "… one or more commanders you control".
  if ((m = /^Spells your opponents cast that target (?:~|this creature|this permanent) cost (?:\{(\d+)\} more|an additional (\d+) life) to cast\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      targetedBySpellsCost: m[1] !== undefined ? { payGeneric: Number(m[1]) } : { payLife: Number(m[2]) },
      text,
    };
  }
  if ((m = /^Spells your opponents cast that target you or a permanent you control cost \{(\d+)\} more to cast\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      targetedBySpellsCost: { payGeneric: Number(m[1]), targetingYou: true, targeting: { controlledBy: "you" } },
      text,
    };
  }
  if ((m = /^Spells your opponents cast that target (?:an? |one or more )(.+?) you control cost \{(\d+)\} more to cast\.$/.exec(line))) {
    const targeting = /^commanders?$/.test(m[1]) ? { isCommander: true } : parseTypePhrase(m[1]);
    if (targeting !== null && Object.keys(targeting).length > 0) {
      return {
        affects: { scope: "self" },
        targetedBySpellsCost: { payGeneric: Number(m[2]), targeting: { ...targeting, controlledBy: "you" } },
        text,
      };
    }
  }
  // Its abilities' half (Kopala).
  if ((m = /^Abilities your opponents activate that target an? (.+?) you control cost \{(\d+)\} more to activate\.$/.exec(line))) {
    const targeting = parseTypePhrase(m[1]);
    if (targeting !== null && Object.keys(targeting).length > 0) {
      return {
        affects: { scope: "self" },
        abilityCostModification: {
          applies: {},
          anyZone: true,
          byOpponents: true,
          targeting: { ...targeting, controlledBy: "you" },
          increaseGeneric: Number(m[2]),
        },
        text,
      };
    }
  }
  if ((m = /^Creatures attacking your opponents have (first strike|double strike)\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { type: "creature", attackingOpponent: true } },
      grantKeywords: [m[1].replace(" ", "-")],
      text,
    };
  }
  const outside = outsideBattlefieldStaticOf(line, text);
  if (outside !== null) return outside;
  const perAmount = perAmountStaticOf(line, text);
  if (perAmount !== null) return perAmount;
  // "… as long as [condition]." on a static the rest reads whole and that
  // has no condition of its own: celebration's "~ gets +1/+1 and has
  // trample as long as two or more nonland permanents entered the
  // battlefield under your control this turn" (Grand Ball Guest).
  for (const [suffix, condition] of STATIC_CONDITION_SUFFIXES) {
    if (!line.endsWith(suffix)) continue;
    const inner = parseStatic(`${line.slice(0, -suffix.length)}.`, text);
    if (inner !== null && inner.condition === undefined) return { ...inner, condition };
  }
  // The most common color among permanents (rule 105.2): Ruham Djinn's "as
  // long as white is the most common color among all permanents or is tied
  // for most common", Heroic Defiance's "unless it shares a color with" one,
  // Call to Arms' "the chosen color … among nontoken permanents the chosen
  // player controls but isn't tied".
  const mostCommon =
    (m = /^(.+) as long as (white|blue|black|red|green) is the most common color among all permanents or is tied for most common\.$/.exec(line))
      ? { kind: "most-common-color", color: COLOR_WORD[m[2]] }
      : (m = /^(.+) as long as the chosen color is the most common color among nontoken permanents the chosen player controls but isn't tied for most common\.$/.exec(line))
        ? { kind: "most-common-color", color: "chosen", among: { nontoken: true, chosenPlayer: true }, untied: true }
        : (m = /^(Enchanted creature .+) unless it shares a color with the most common color among all permanents or a color tied for most common\.$/.exec(line))
          ? { kind: "not", of: { kind: "most-common-color", sharedBy: "attached" } }
          : null;
  if (mostCommon !== null) {
    const inner = parseStatic(`${m[1]}.`, text);
    if (inner !== null && inner.condition === undefined) return { ...inner, condition: mostCommon };
  }
  // A static acting on a player. Abyssal Persecutor; the player a Curse
  // enchants: what they control, the damage dealt to them, the life they gain.
  if (line === "You can't win the game and your opponents can't lose the game.") {
    return { affects: { scope: "self" }, cantWinGame: true, opponentsCantLoseGame: true, text };
  }
  // "If [a player] would begin an extra turn, that player skips that turn instead"
  // (rule 614.10).
  if ((m = /^If (a player|an opponent) would begin an extra turn, that player skips that turn instead\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      replacement: { event: "would-begin-turn", who: m[1] === "a player" ? "any" : "opponent", extraOnly: true },
      text,
    };
  }
  // A land tapped for mana producing another type (rules 106.12, 614.1a):
  // any land (Infernal Darkness), or by basic land type (Reality Twist).
  if ((m = /^If a land is tapped for mana, it produces \{([WUBRGC])\} instead of any other type\.$/.exec(line))) {
    return { affects: { scope: "self" }, landManaInstead: [{ produces: m[1], tapper: "any" }], text };
  }
  if ((m = /^If tapped for mana, (.+) instead of any other type\.$/.exec(line))) {
    const entries = [];
    for (const part of m[1].split(/, and |, /)) {
      const e = /^(Plains|Islands|Swamps|Mountains|Forests) produce \{([WUBRGC])\}$/.exec(part);
      if (e === null) return null;
      entries.push({ filter: { subtype: e[1] === "Plains" ? "Plains" : e[1].slice(0, -1) }, produces: e[2], tapper: "any" });
    }
    return { affects: { scope: "self" }, landManaInstead: entries, text };
  }
  // Unspent mana as steps and phases end (rule 500.4): kept, of one colour
  // (Leyline Tyrant) or by every player (Upwelling); turned into another type
  // (Kruphix, Horizon Stone; Omnath, Locus of All); or costing life (Yurlok).
  if ((m = /^You don't lose unspent (white|blue|black|red|green) mana as steps and phases end\.$/.exec(line))) {
    return { affects: { scope: "self" }, keepsUnspentMana: [COLOR_WORD[m[1]]], text };
  }
  if (line === "Players don't lose unspent mana as steps and phases end.") {
    return {
      affects: { scope: "self" },
      keepsUnspentMana: ["W", "U", "B", "R", "G", "C"],
      keepsUnspentManaEachPlayer: true,
      text,
    };
  }
  if ((m = /^If you would lose unspent mana, that mana becomes (colorless|white|blue|black|red|green) instead\.$/.exec(line))) {
    return m[1] === "colorless"
      ? { affects: { scope: "self" }, unspentManaBecomesColorless: true, text }
      : { affects: { scope: "self" }, unspentManaBecomes: COLOR_WORD[m[1]], text };
  }
  if (line === "A player losing unspent mana causes that player to lose that much life.") {
    return { affects: { scope: "self" }, manaLossCausesLifeLoss: true, text };
  }
  // A would-draw replacement of your own (rule 614.1a, 614.11): "draw N cards
  // instead" (Thought Reflection), "except the first one you draw in each of
  // your draw steps" (Teferi's Ageless Insight), "the first time you would
  // draw a card each turn" (Reed Richards, Smartest Man), or an effect
  // instead of the draw (Underrealm Lich, Tomorrow, Azami's Familiar).
  if (
    (m =
      /^(If you would draw a card|The first time you would draw a card each turn)( except the first (?:one|card) you draw (?:in|during) each of your draw steps)?, (?:you )?draw (two|three|four) cards instead\.$/.exec(
        line,
      ))
  ) {
    return {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        instead: { draws: NUMBERS[m[3]] },
        ...(m[2] !== undefined ? { exceptFirstInDrawStep: true } : {}),
        ...(m[1].startsWith("The first time") ? { firstEachTurn: true } : {}),
      },
      text,
    };
  }
  if (
    (m = /^If you would draw a card, instead (.+)$/.exec(line)) ??
    (m = /^If you would draw a card, (.+?) instead\.( .+)?$/.exec(line))
  ) {
    const body = m[2] !== undefined ? `${m[1]}.${m[2]}` : m[1];
    const sentence = body.charAt(0).toUpperCase() + body.slice(1);
    const effect = drawInsteadLookOf(sentence) ?? parseEffect(sentence, { targets: [] });
    const parsed = "kind" in effect ? { effect, todo: [] } : effect;
    if (parsed.effect !== null && parsed.todo.length === 0) {
      return {
        affects: { scope: "self" },
        replacement: { event: "would-draw", who: "you", instead: { effect: parsed.effect } },
        text,
      };
    }
  }
  if (line === "Enchanted player can't gain life.") {
    return { affects: { scope: "self" }, replacement: { event: "would-gain-life", who: "enchanted-player", prevent: true }, text };
  }
  if (line === "If a source would deal damage to enchanted player, it deals double that damage to that player instead.") {
    return { affects: { scope: "self" }, replacement: { event: "would-deal-damage", multiplier: 2, to: "enchanted-player" }, text };
  }
  const creaturesEnchanted = { affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player" } } };
  if ((m = /^Creatures enchanted player controls get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return { ...creaturesEnchanted, grantPt: [Number(m[1]), Number(m[2])], text };
  }
  if (line === "Creatures enchanted player controls attack each combat if able.") {
    return { ...creaturesEnchanted, restrictions: ["must-attack"], text };
  }
  if (line === "Nonlegendary creatures enchanted player controls have base power and toughness 3/3 and lose all creature types.") {
    return {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "enchanted-player", notSupertype: "legendary" } },
      setBasePt: { power: 3, toughness: 3 },
      loseCreatureTypes: true,
      text,
    };
  }
  // "White creatures get +1/+1" (Divine Sacrament's first line, Call to Arms').
  if ((m = /^(White|Blue|Black|Red|Green) creatures get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { type: "creature", colors: [COLOR_WORD[m[1].toLowerCase()]] } },
      grantPt: [Number(m[2]), Number(m[3])],
      text,
    };
  }
  // "… as long as defending player controls an artifact." — the player the
  // creature attacks (rule 802.2a), Bouncing Beebles; "three or more
  // artifacts" (Ayesha Tanaka), "an untapped land" (Hazy Homunculus), "has
  // a rad counter" (Nightkin Ambusher).
  m = /^(.+) as long as defending player (?:controls (an?|one or more|two or more|three or more|four or more|five or more) (untapped )?([^.]+)|has an? (rad|poison) counter)\.$/.exec(line);
  if (m !== null) {
    const filter = m[4] === undefined ? undefined : parseTypePhrase(m[4]);
    const atLeast = m[2] === undefined ? 1 : ({ two: 2, three: 3, four: 4, five: 5 }[m[2].split(" ")[0]] ?? 1);
    const condition =
      m[5] !== undefined
        ? { kind: "player-counters", counter: m[5], who: "you", atLeast: 1 }
        : filter === null || filter === undefined || Object.keys(filter).length === 0
          ? null
          : { kind: "controls", filter: { ...filter, ...(m[3] ? { tapped: false } : {}) }, atLeast };
    const inner = condition === null ? null : parseStatic(`${m[1]}.`, text);
    if (inner !== null && inner.condition === undefined && inner.affects?.scope === "self") {
      return { ...inner, condition: { kind: "of-player", player: "defending-player", condition } };
    }
  }
  for (const [prefix, condition] of STATIC_CONDITION_PREFIXES) {
    if (!line.startsWith(prefix)) continue;
    const rest = line.slice(prefix.length).replace(/^it /, "~ ");
    const inner = parseStatic(rest.charAt(0).toUpperCase() + rest.slice(1), text);
    if (inner !== null && inner.condition === undefined) return { ...inner, condition };
  }
  // "Nontoken creatures you control have riot" (Rhythm of the Wild, Uncivil
  // Unrest): asked of each as it enters (rule 614.12).
  if (line === "Nontoken creatures you control have riot.") {
    return {
      affects: { scope: "filter", filter: { type: "creature", token: false, controlledBy: "you" } },
      grantKeywords: ["riot"],
      text,
    };
  }
  // "Instant and sorcery spells you control have rebound" (Cast Through Time).
  if (line === "Instant and sorcery spells you control have rebound.") {
    return {
      affects: { scope: "self" },
      grantsToSpells: { keywords: ["rebound"], filter: { typesAnyOf: ["instant", "sorcery"] } },
      text,
    };
  }
  // A casting ability given to the spells you cast (`grantsToSpells`):
  // "Artifact spells you cast have convoke" (Chief Engineer), "Nonartifact
  // spells you cast have improvise" (Inspiring Statuary), "Spells you cast
  // from exile have convoke" (Hoarding Broodlord), "Dinosaur spells you cast
  // have prowl {2}{R}" (Hunting Velociraptor).
  m = /^(?:(.+?) )?[Ss]pells you cast( from exile)? have (convoke|improvise|prowl ((?:\{[^}]+\})+))\.$/.exec(line);
  if (m !== null) {
    // The sentence's capital belongs to a type word ("Nonartifact",
    // "Legendary creature"), not a subtype's ("Dinosaur").
    const lowered = m[1] === undefined ? null : parseTypePhrase(m[1].charAt(0).toLowerCase() + m[1].slice(1));
    const filter =
      m[1] === undefined
        ? {}
        : lowered !== null && !(typeof lowered.subtype === "string" && /^[a-z]/.test(lowered.subtype))
          ? lowered
          : parseTypePhrase(m[1]);
    if (filter !== null && (m[1] === undefined || Object.keys(filter).length > 0)) {
      const grant = m[3] === "convoke" ? { convoke: true } : m[3] === "improvise" ? { improvise: true } : { prowl: m[4] };
      return {
        affects: { scope: "self" },
        grantsToSpells: {
          ...(m[1] !== undefined ? { filter } : {}),
          ...(m[2] !== undefined ? { castFrom: ["exile"] } : {}),
          ...grant,
        },
        text,
      };
    }
  }
  // Cascade for the first matching spell each turn (`grantsToSpells` with
  // `firstEachTurn`): "The first spell you cast each turn has cascade"
  // (Maelstrom Nexus), "… from exile …" (Wild-Magic Sorcerer — the filter's
  // `castFrom`, so each earlier spell is asked where it was cast from), "…
  // that mana from a Treasure was spent to cast …" (Rain of Riches).
  m = /^The first (?:(.+?) )?spell you cast( from exile)? each turn( that mana from an? (\w+) was spent to cast)? has cascade\.$/.exec(line);
  if (m !== null) {
    const typed = m[1] === undefined ? {} : flashSpellsFilter(m[1]);
    if (typed !== null && typed !== true) {
      const filter = {
        ...typed,
        ...(m[2] !== undefined ? { castFrom: "exile" } : {}),
        ...(m[4] !== undefined ? { manaFrom: CARD_TYPES.includes(m[4].toLowerCase()) ? { type: m[4].toLowerCase() } : { subtype: m[4] } } : {}),
      };
      return {
        affects: { scope: "self" },
        grantsToSpells: {
          ...(Object.keys(filter).length > 0 ? { filter } : {}),
          firstEachTurn: true,
          triggered: [CASCADE_TRIGGER],
        },
        text,
      };
    }
  }
  // A printed "can't be the target of …" that isn't the keyword
  // (`hexproofFrom` with its qualifiers — rules 601.2c, 602.2b): "~ can't be
  // the target of black or red spells your opponents control" (Fiendslayer
  // Paladin), "… of black spells or abilities from black sources"
  // (Mercenary Informer, any player's), "Creatures can't be the targets of
  // spells" (Dense Foliage), "… of abilities from artifact sources".
  m = /^(~|Enchanted creature|Equipped creature|Creatures you control|Creatures) can't be the targets? of (.+?)\.$/.exec(line);
  if (m !== null) {
    const hexproof = untargetablePhrase(m[2]);
    if (hexproof !== null) {
      const affects =
        m[1] === "~"
          ? { scope: "self" }
          : m[1] === "Creatures you control"
            ? { scope: "creatures-you-control" }
            : m[1] === "Creatures"
              ? { scope: "all-creatures" }
              : { scope: "attached" };
      // Not the keyword, so a loss of hexproof doesn't take it (Shanna,
      // Sisay's Legacy against Shadowspear).
      return { affects, hexproofFrom: { ...hexproof, notHexproof: true }, text };
    }
  }
  // "Cards in graveyards can't be the targets of spells or abilities"
  // (Ground Seal, Silent Gravestone — `graveyardCardsUntargetable`).
  if (line === "Cards in graveyards can't be the targets of spells or abilities.") {
    return { affects: { scope: "self" }, graveyardCardsUntargetable: {}, text };
  }
  // What an Aura says of its host: Fall from Favor (its controller, read at each
  // untap step), Street Savvy (the blocker's side of rule 702.14), Power Artifact
  // (rule 602.2b, the host's abilities alone), Demonic Torment.
  if (line === "Enchanted creature doesn't untap during its controller's untap step unless that player is the monarch.") {
    return {
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "source", filter: { attachedTo: { controlledBy: "monarch" } } } },
      restrictions: ["doesnt-untap"],
      text,
    };
  }
  if (line === "Enchanted creature gets +0/+2 and can block creatures with landwalk abilities as though they didn't have those abilities.") {
    return { affects: { scope: "attached" }, grantPt: [0, 2], blocksDespiteLandwalk: true, text };
  }
  m = /^Enchanted artifact's activated abilities cost \{(\d+)\} less to activate\. This effect can't reduce the mana in that cost to less than one mana\.$/.exec(line);
  if (m !== null) {
    return {
      affects: { scope: "self" },
      abilityCostModification: { applies: { hostOfSource: true }, reduceGeneric: Number(m[1]), leavesOneMana: true },
      text,
    };
  }
  if (line === "Enchanted creature can't attack.") {
    return { affects: { scope: "attached" }, restrictions: ["cant-attack"], text };
  }
  if (line === "Prevent all combat damage that would be dealt by enchanted creature.") {
    return { affects: { scope: "self" }, replacement: { event: "would-deal-damage", fromAttached: true, combat: true, prevent: true }, text };
  }
  if (line === "Enchanted creature's activated abilities can't be activated.") {
    return { affects: { scope: "attached" }, prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } }, text };
  }
  // Favor of the Mighty: one comparison over every creature, ties all counted.
  if (line === "Each creature with the greatest mana value has protection from each color.") {
    return {
      affects: {
        scope: "filter",
        filter: { type: "creature", greatestInZone: { of: "mana-value", among: { type: "creature" } } },
      },
      protection: { colors: ["W", "U", "B", "R", "G"] },
      text,
    };
  }
  // The Runes: "As long as enchanted permanent is a creature, it gets +1/+1
  // and has trample" / "… is an Equipment, it has 'Equipped creature gets
  // …'" — the enchanted permanent's static, gated on what it is.
  m = /^As long as enchanted permanent is (a creature|an Equipment), it (.+(?:\.|\."))$/.exec(line);
  if (m !== null) {
    const inner = parseStatic(`Enchanted creature ${m[2]}`, text);
    if (inner !== null && inner.condition === undefined && inner.affects?.scope === "attached") {
      const host = m[1] === "a creature" ? { type: "creature" } : { subtype: "Equipment" };
      return { ...inner, condition: { kind: "source", filter: { attachedTo: host } } };
    }
  }
  // "If another [red] source you control would deal [noncombat] damage to …, it
  // deals that much damage plus N … instead" (Thor, Asgard's Avenger; Embermaw
  // Hellion; Tor Wauki the Younger) — `fromOther`, by object.
  m = /^If another ((?:white|blue|black|red|green) )?source you control would deal (noncombat )?damage to (an opponent or a permanent an opponent controls|a permanent or player), it deals that much damage plus (\d+)(?: to that permanent or player)? instead\.$/.exec(line);
  if (m !== null) {
    const colors = m[1] === undefined ? {} : { colors: [COLOR_WORD[m[1].trim()]] };
    return {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: Number(m[4]),
        ...(m[2] !== undefined ? { combat: false } : {}),
        fromOther: true,
        source: { ...colors, controlledBy: "you" },
        ...(m[3] === "a permanent or player" ? {} : { to: "opponent-side" }),
      },
      text,
    };
  }
  // A static prevention (rule 615): "prevent all noncombat damage that would
  // be dealt to other creatures you control" (Crystal Barricade, Tajic).
  m = /^Prevent all (combat |noncombat )?damage that would be dealt to (other )?creatures you control\.$/.exec(line);
  if (m !== null) {
    return {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        ...(m[1] !== undefined ? { combat: m[1] === "combat " } : {}),
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
        ...(m[2] !== undefined ? { toOther: true } : {}),
      },
      text,
    };
  }
  // "~ has all activated abilities of …" (rule 613.1f) — `grantsActivatedOf`:
  // graveyard cards (Necrotic Ooze, Thranduil), other permanents (Experiment
  // Kraj, Marvin, Sharkey), loyalty abilities only (Nicol Bolas, Dragon-God),
  // and the library's top card (Skill Borrower).
  {
    const w = /^(?:As long as ~ is on the battlefield, it|~) has all (activated|loyalty) abilities of (.+?)( except mana abilities| except for loyalty abilities)?\.$/.exec(line);
    const spec = w === null ? null : grantsActivatedOfPhrase(w[2]);
    if (spec !== null) {
      return {
        affects: { scope: "self" },
        grantsActivatedOf: {
          ...spec,
          ...(w[1] === "loyalty" ? { only: "loyalty" } : {}),
          ...(w[3] !== undefined ? { except: w[3].includes("mana") ? "mana" : "loyalty" } : {}),
        },
        text,
      };
    }
    const t = /^As long as the top card of your library is (?:an? )?(.+?) card, ~ has all activated abilities of that card\.$/.exec(line);
    const top = t === null ? null : parseTypePhrase(t[1], { cards: true });
    if (top !== null && Object.keys(top).length > 0) {
      return { affects: { scope: "self" }, grantsActivatedOf: { zone: "library-top", filter: top }, text };
    }
    // Cards in exile: with a counter (Rex, Cyber-Hound; Mairsil, the Pretender's
    // limit), exiled with this permanent (Myr Welder, Territory Forge; Steward of
    // the Harvest's group; Hazel's Brewmaster's Foods), its one exiled card or the
    // last chosen with their triggered abilities too (Idris; Koh).
    const counted =
      /^~ has all activated abilities of all cards( you own)? in exile with (\w+) counters on them\.( You may activate each of those abilities only once each turn\.)?$/.exec(line);
    if (counted !== null) {
      return {
        affects: { scope: "self" },
        grantsActivatedOf: {
          zone: "exile",
          filter: {
            ...(counted[1] !== undefined ? { ownedBy: "you" } : {}),
            counters: { kind: counted[2], compare: { op: "gte", n: 1 } },
          },
          ...(counted[3] !== undefined ? { onceEach: true } : {}),
        },
        text,
      };
    }
    const own = /^~ has all activated abilities of (?:all (?:(.+?) )?cards exiled with (?:it|~)|the exiled card)\.$/.exec(line);
    const ownFilter = own === null ? null : own[1] === undefined ? {} : parseTypePhrase(own[1], { cards: true });
    if (ownFilter !== null) {
      return { affects: { scope: "self" }, grantsActivatedOf: { zone: "exiled-with", filter: ownFilter }, text };
    }
    const group =
      /^(Creatures|Foods) you control( with \+1\/\+1 counters on them)? have all activated abilities of all (.+?) cards exiled with ~\.$/.exec(line);
    const groupFilter = group === null ? null : parseTypePhrase(group[3], { cards: true });
    if (groupFilter !== null) {
      const counters = group[2] !== undefined ? { counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } } : {};
      return {
        affects:
          group[1] === "Foods"
            ? { scope: "filter", filter: { subtype: "Food", controlledBy: "you" } }
            : group[2] !== undefined
              ? { scope: "filter", filter: { type: "creature", controlledBy: "you", ...counters } }
              : { scope: "creatures-you-control" },
        grantsActivatedOf: { zone: "exiled-with", filter: groupFilter },
        text,
      };
    }
    const both =
      /^~ has all activated and triggered abilities of the (exiled|last chosen) card( and gets \+X\/\+X, where X is the exiled card's mana value)?\.$/.exec(line);
    if (both !== null) {
      return {
        affects: { scope: "self" },
        grantsActivatedOf: {
          zone: both[1] === "exiled" ? "exiled-with" : "chosen-exiled",
          filter: {},
          withTriggered: true,
        },
        ...(both[2] !== undefined ? { grantPtPerCount: { exiledWithSourceManaValue: true, pt: [1, 1] } } : {}),
        text,
      };
    }
  }
  // "Mana of any type can be spent to activate ~'s abilities" (Sharkey,
  // Tyrant of the Shire) / "… as though it were mana of any color to pay the
  // activation costs of ~'s abilities" (Manascape Refractor), rule 118.14.
  if (line === "Mana of any type can be spent to activate ~'s abilities.") {
    return { affects: { scope: "self" }, spendManaAs: { as: "any-type", activating: "this" }, text };
  }
  if (line === "You may spend mana as though it were mana of any color to pay the activation costs of ~'s abilities.") {
    return { affects: { scope: "self" }, spendManaAs: { as: "any-color", activating: "this" }, text };
  }
  // "You may spend white mana as though it were red mana" (Sunglasses of Urza,
  // rule 609.4b) — `SpendUnitAs`.
  const spendUnit = /^You may spend (white|blue|black|red|green|colorless) mana as though it were (white|blue|black|red|green) mana\.$/.exec(line);
  if (spendUnit !== null) {
    const symbol = { white: "W", blue: "U", black: "B", red: "R", green: "G", colorless: "C" };
    return {
      affects: { scope: "self" },
      spendManaAs: { as: { unit: symbol[spendUnit[1]], as: symbol[spendUnit[2]] } },
      text,
    };
  }
  // Rule 722.3a — `entersPrepared()`.
  if (line === "~ enters prepared.") {
    return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", prepared: true }, text };
  }
  // An aggregate over a set (`AggregateSpec`): Carrion Grub's "~ gets +X/+0,
  // where X is the greatest power among creature cards in your graveyard",
  // Ambitious Dragonborn's "~ enters with X +1/+1 counters on it, where X is
  // the greatest power among creatures you control and creature cards in
  // your graveyard", Crackling Drake's "~'s power is equal to the total
  // number of instant and sorcery cards you own in exile and in your
  // graveyard".
  {
    const w = /^~ gets \+X\/\+(0|X), where X is (.+)\.$/.exec(line);
    const agg = w === null ? null : aggregatePhraseOf(w[2]);
    if (agg !== null) return { affects: { scope: "self" }, grantPtPerCount: { aggregate: agg, pt: [1, w[1] === "X" ? 1 : 0] }, text };
  }
  // Embodiment of Agonies: one counter for each different mana cost (or
  // mana value) among some of your graveyard's cards.
  {
    const w = /^~ enters with a \+1\/\+1 counter on it for each different (mana cost|mana value) among (.+) cards in your graveyard\.$/.exec(line);
    const filter = w === null ? null : parseTypePhrase(w[2], { cards: true });
    if (filter !== null) {
      const of = w[1] === "mana cost" ? "mana-cost" : "mana-value";
      const amount = { aggregate: "distinct", of, filter: { ...filter, ownedBy: "you" }, in: "graveyards" };
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount } }, text };
    }
  }
  {
    const w = /^~ enters with X \+1\/\+1 counters on it, where X is (.+)\.$/.exec(line);
    const agg = w === null ? null : aggregatePhraseOf(w[1]);
    if (agg !== null) {
      // An "other" is kept as printed, though the entering permanent is
      // never among what's already there (rule 614.12 — Towering Titan).
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: agg } }, text };
    }
  }
  {
    const w = /^~'s power is equal to (.+)\.$/.exec(line);
    const agg = w === null ? null : aggregatePhraseOf(w[1]);
    if (agg !== null && (agg.in !== undefined || agg.plus !== undefined)) {
      return {
        affects: { scope: "self" },
        setBasePtFromCount: { countOf: agg, plusPower: 0, plusToughness: 0, only: "power" },
        text,
      };
    }
  }
  // "If ~ would enter, sacrifice a Swamp instead. If you do, put ~ onto the
  // battlefield. If you don't, put it into its owner's graveyard." — and Mox
  // Diamond's discard, Sheltered Valley's and Overlaid Terrain's sacrifices
  // with no "if you don't" (`EnterInstead`, rule 614.12).
  {
    const orElse = "If you do, put ~ onto the battlefield\\. If you don't, put it into its owner's graveyard\\.";
    const sac = new RegExp(`^If ~ would enter, sacrifice (an?|two|three) (untapped )?([A-Z][a-z]+|lands?) instead\\. ${orElse}$`).exec(line);
    if (sac !== null) {
      const count = sac[1] === "two" ? 2 : sac[1] === "three" ? 3 : 1;
      const what = /^land/.test(sac[3]) ? { type: "land" } : { subtype: sac[3] };
      const filter = { ...what, ...(sac[2] !== undefined ? { tapped: false } : {}) };
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", instead: { sacrifice: { filter, count } } }, text };
    }
    const disc = new RegExp(`^If ~ would enter, you may discard an? ([a-z]+) card instead\\. ${orElse}$`).exec(line);
    if (disc !== null) {
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", instead: { discard: { filter: { type: disc[1] } } } }, text };
    }
    if (line === "If ~ would enter, instead sacrifice each other permanent named ~ you control, then put ~ onto the battlefield.") {
      const name = /permanent named (.+?) you control/.exec(text)?.[1];
      if (name !== undefined) {
        return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", instead: { sacrifice: { filter: { name }, count: "all" } } }, text };
      }
    }
    if (line === "As ~ enters, sacrifice all lands you control.") {
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", instead: { sacrifice: { filter: { type: "land" }, count: "all" } } }, text };
    }
  }
  // Thief of Blood's "As ~ enters, remove all counters from all permanents.
  // ~ enters with a +1/+1 counter on it for each counter removed this way."
  // (rule 614.1c): one replacement, `removeAllCountersFrom` and the count.
  {
    const w = /^As ~ enters, remove all counters from all ([a-z ]+)\. ~ enters with an? ([+-]\d+\/[+-]\d+|[a-z]+) counter on it for each counter removed this way\.$/.exec(line);
    const filter = w === null ? null : w[1] === "permanents" ? {} : parseTypePhrase(w[1]);
    if (filter !== null && w !== null) {
      return {
        affects: { scope: "self" },
        replacement: { event: "enters-battlefield", removeAllCountersFrom: filter, counters: { kind: w[2], amount: "removed-as-enters" } },
        text,
      };
    }
  }
  // "~ enters with two oil counters on it" (rule 614.1c), any named kind —
  // "on him" / "on her" for a character (Captain America's shield counter).
  {
    const w = /^~ enters with (a|an|one|two|three|four|five|six|seven|eight|nine|ten|\d+) ([+-]\d+\/[+-]\d+|[a-z]+) counters? on (?:it|him|her)\.$/.exec(line);
    if (w !== null) {
      const words = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
      const amount = words[w[1]] ?? Number(w[1]);
      return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: w[2], amount } }, text };
    }
  }
  // Rule 702.14 (Legends' Quagmire): a landwalk ignored for blocks.
  {
    const w = /^Creatures with (plainswalk|islandwalk|swampwalk|mountainwalk|forestwalk|desertwalk) can be blocked as though they didn't have \1\.$/.exec(line);
    if (w !== null) return { affects: { scope: "self" }, blockableDespiteLandwalk: [w[1]], text };
  }
  // Rule 702.14a: landwalk of a kind no keyword names, its land as a filter
  // (`StaticAbility.landwalk`) — printed (Dryad Sophisticate), on what an
  // Equipment or Aura is attached to (Trailblazer's Boots, Vectis Gloves), or
  // of the type chosen as it entered (Traveler's Cloak).
  {
    const kinds = { nonbasic: { type: "land", notSupertype: "basic" }, artifact: { types: ["artifact", "land"] } };
    const own = /^(Nonbasic|Artifact) landwalk$/.exec(line);
    if (own !== null) return { affects: { scope: "self" }, landwalk: kinds[own[1].toLowerCase()], text };
    const w = /^(?:Equipped|Enchanted) creature (?:gets ([+-]\d+)\/([+-]\d+) and )?has (nonbasic landwalk|artifact landwalk|landwalk of the chosen type)\.$/.exec(line);
    if (w !== null) {
      return {
        affects: { scope: "attached" },
        ...(w[1] !== undefined ? { grantPt: [Number(w[1]), Number(w[2])] } : {}),
        landwalk: w[3] === "landwalk of the chosen type" ? "chosen-land-type" : kinds[w[3].split(" ")[0]],
        text,
      };
    }
  }
  // Rule 502.3 (Antiquities): its controller's choice in the untap step.
  if (line === "You may choose not to untap ~ during your untap step.") {
    return { affects: { scope: "self" }, mayChooseNotToUntap: true, text };
  }
  if (line === "~ enters tapped.") {
    return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text };
  }
  // Web-slinging's returned creature (rule 702.188a — Scarlet Spider, Ben
  // Reilly): its mana value as it last existed, 0 unless web-slinging paid.
  if (/^If ~ was cast using web-slinging, (?:it|he|she|they) enters? with X \+1\/\+1 counters on (?:it|him|her|them), where X is the mana value of the returned creature\.$/.test(line)) {
    return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "web-slinging-mana-value" } }, text };
  }
  // Rule 509.1a's one block, and more (`blockAdditional`): "~ can block an
  // additional creature each combat", "an additional seven creatures",
  // "any number of creatures" — its own, an Aura's or Equipment's, or each
  // of yours (Brave the Sands).
  {
    const w = /^(~|Enchanted creature|Equipped creature|Each creature you control) can block (an additional creature each combat|an additional (two|three|four|five|six|seven|eight|nine|ten|ninety-nine) creatures each combat|any number of creatures)\.$/.exec(line);
    if (w !== null) {
      const words = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, "ninety-nine": 99 };
      const affects =
        w[1] === "~" ? { scope: "self" } : w[1] === "Each creature you control" ? { scope: "creatures-you-control" } : { scope: "attached" };
      const blockAdditional = w[2].startsWith("any") ? "any" : w[3] !== undefined ? words[w[3]] : 1;
      return { affects, blockAdditional, text };
    }
  }
  // Layer 6 (`loseAllAbilities`): Humility's cousins, and the Auras that
  // take a creature's abilities with a P/T change beside (Mystic Subdual's
  // "-2/-0", Kasmina's Transmutation's "base power and toughness 1/1").
  {
    const w = /^(All creatures|Creatures|Enchanted creature|Enchanted permanent)(?: gets ([+-]\d+)\/([+-]\d+) and)? loses? all abilities(?: and (?:has|have) base power and toughness (\d+)\/(\d+))?\.$/.exec(line);
    if (w !== null) {
      return {
        affects: w[1].startsWith("Enchanted") ? { scope: "attached" } : { scope: "all-creatures" },
        // `+ 0`: "-0" is 0.
        ...(w[2] !== undefined ? { grantPt: [Number(w[2]) + 0, Number(w[3]) + 0] } : {}),
        loseAllAbilities: true,
        ...(w[4] !== undefined ? { setBasePt: { power: Number(w[4]), toughness: Number(w[5]) } } : {}),
        text,
      };
    }
  }
  if (line === "~ can't block.") return { affects: { scope: "self" }, restrictions: ["cant-block"], text };
  // "If a creature dealt damage by ~ this turn would die, exile it instead"
  // (Kumano's Pupils): the dies-only graveyard replacement, about one source.
  if (line === "If a creature dealt damage by ~ this turn would die, exile it instead.") {
    return {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", damagedThisTurnBy: { source: "this" } },
      },
      text,
    };
  }
  // A cost to attack (rule 508.1h, `attackTax`): "Creatures can't attack you
  // unless their controller pays {2} for each creature they control that's
  // attacking you" (Ghostly Prison), "you or planeswalkers you control …
  // for each of those creatures" (Baird), "planeswalkers you control" (Onakke
  // Oathkeeper), and {X} by a count (Sphere of Safety, Collective Restraint).
  if ((m = ATTACK_TAX_LINE.exec(line))) {
    const covers = attackTaxCovers(m[1], m[3]);
    const generic = m[2] === "X" ? attackTaxCount(m[4]) : m[4] === undefined ? Number(m[2]) : null;
    if (covers !== null && generic !== null) {
      return { affects: { scope: "self" }, attackTax: { generic, ...(covers === "you" ? {} : { covers }) }, text };
    }
  }
  // "Creatures with power 2 or less can't attack you" (Reverence): the player
  // alone (`cantAttackController: "player"`, rule 508.1b).
  if ((m = /^(.+) can't attack you\.$/.exec(line))) {
    const filter = attackingCreatures(m[1]);
    if (filter !== null) return { affects: { scope: "filter", filter }, cantAttackController: "player", text };
  }
  // Elephant Grass's other half, a `combatTax` by colour on attacking you.
  if ((m = /^(.+) can't attack you unless their controller pays \{(\d+)\} for each creature they control that's attacking you\.$/.exec(line))) {
    const filter = attackingCreatures(m[1]);
    if (filter !== null) {
      return { affects: { scope: "filter", filter }, combatTax: { on: ["attack"], generic: Number(m[2]), covers: "you" }, text };
    }
  }
  // Heat Wave's: a cost to block by colour, in life, on what "you" control.
  if ((m = /^(.+) can't block creatures you control unless their controller pays (\d+) life for each blocking creature they control\.$/.exec(line))) {
    const filter = attackingCreatures(m[1]);
    if (filter !== null) {
      return {
        affects: { scope: "filter", filter },
        combatTax: { on: ["block"], life: Number(m[2]), attacker: { controlledBy: "you" } },
        text,
      };
    }
  }
  // "~ can't attack during extra turns" (Medomai): the `extra-turn` condition.
  if (line === "~ can't attack during extra turns.") {
    return { affects: { scope: "self" }, condition: { kind: "extra-turn" }, restrictions: ["cant-attack"], text };
  }
  // "~ can't attack a player it has already attacked this turn" (Port Razer).
  if (line === "~ can't attack a player it has already attacked this turn.") {
    return { affects: { scope: "self" }, restrictions: ["cant-attack-player-attacked-this-turn"], text };
  }
  // A cost on a creature to attack or block (rules 508.1h, 509.1d, `combatTax`):
  // "~ can't attack unless you pay {1} for each +1/+1 counter on it" (Phyrexian
  // Marauder), "Enchanted creature can't attack or block unless its controller
  // pays {3}" (Brainwash, Oppressive Rays), "… {1} for each card in your hand"
  // (Cowed by Wisdom).
  if ((m = /^(~|Enchanted creature|Equipped creature) can't (attack|block|attack or block) unless (you pay|its controller pays) \{(\d+)\}(?: for each (\+1\/\+1 counter on it|card in your hand))?\.$/.exec(line))) {
    if ((m[1] === "~") === (m[3] === "you pay") && (m[5] !== "card in your hand" || m[4] === "1")) {
      const on = m[2] === "attack or block" ? ["attack", "block"] : [m[2]];
      const amount =
        m[5] === "card in your hand"
          ? { generic: "cards-in-your-hand" }
          : { generic: Number(m[4]), ...(m[5] === undefined ? {} : { perCounter: "+1/+1" }) };
      return { affects: { scope: m[1] === "~" ? "self" : "attached" }, combatTax: { on, ...amount }, text };
    }
  }
  // "~ can't block creatures with power 3 or greater unless you pay {1}" (Hipparion).
  if ((m = /^~ can't block creatures with power (\d+) or greater unless you pay \{(\d+)\}\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      combatTax: { on: ["block"], generic: Number(m[2]), attacker: { power: { op: "gte", n: Number(m[1]) } } },
      text,
    };
  }
  // "Enchanted creature can't be blocked unless defending player pays {3} for
  // each creature they control that's blocking it" (Awesome Presence).
  if ((m = /^Enchanted creature can't be blocked unless defending player pays \{(\d+)\} for each creature they control that's blocking it\.$/.exec(line))) {
    return { affects: { scope: "attached" }, combatTax: { on: ["be-blocked"], generic: Number(m[1]) }, text };
  }
  // "… unless its controller pays {X}, where X is the number of counters on that creature" (Nils).
  if (/^Each creature with one or more counters on it can't attack you or planeswalkers you control unless its controller pays \{X\}, where X is the number of counters on that creature\.$/.test(line)) {
    return {
      affects: { scope: "all-creatures" },
      combatTax: { on: ["attack"], generic: 1, perCounter: "any", covers: "you-and-planeswalkers" },
      text,
    };
  }
  // Restrictions asked of the defending (or attacking) player — rules 508.1c
  // and 509.1b: "~ can't attack unless defending player controls an Island".
  if ((m = /^~ can't (attack unless|attack if|block unless) (defending|attacking) player (controls an? (.+)|is the monarch|is poisoned|has (\w+) or more cards in their graveyard)\.$/.exec(line))) {
    const field = { "attack unless": "cantAttackUnlessDefender", "attack if": "cantAttackIfDefender", "block unless": "cantBlockUnlessAttacker" }[m[1]];
    if ((field === "cantBlockUnlessAttacker") !== (m[2] === "attacking")) return null;
    if (m[4] !== undefined) {
      const filter = playerTestPermanent(m[4]);
      return filter === null ? null : { affects: { scope: "self" }, [field]: { controls: filter }, text };
    }
    if (m[5] !== undefined) {
      const atLeast = numberOf(m[5]);
      return typeof atLeast !== "number" ? null : { affects: { scope: "self" }, [field]: { holds: { kind: "cards-in-graveyard", atLeast } }, text };
    }
    const holds = m[3] === "is the monarch" ? { kind: "monarch", who: "you" } : { kind: "player-counters", who: "you", counter: "poison", atLeast: 1 };
    return { affects: { scope: "self" }, [field]: { holds }, text };
  }
  // The same restriction asked of you: "~ can't block if you control an
  // untapped land" (Branded Brawlers), "~ can't block unless you have four or
  // more cards in hand" (Vantress Gargoyle) — a condition on the static.
  if ((m = /^~ can't (attack|block) if you control an? (.+)\.$/.exec(line))) {
    const filter = playerTestPermanent(m[2]);
    if (filter === null) return null;
    return { affects: { scope: "self" }, condition: { kind: "controls", filter, atLeast: 1 }, restrictions: [m[1] === "attack" ? "cant-attack" : "cant-block"], text };
  }
  if ((m = /^~ can't (attack|block) unless you have (\w+) or more cards in hand\.$/.exec(line))) {
    const atLeast = numberOf(m[2]);
    if (typeof atLeast !== "number") return null;
    return { affects: { scope: "self" }, condition: { kind: "hand-size", atMost: atLeast - 1 }, restrictions: [m[1] === "attack" ? "cant-attack" : "cant-block"], text };
  }
  if ((m = /^~ can't (attack|block) unless you control more (creatures|lands) than (defending|attacking) player\.$/.exec(line))) {
    if ((m[1] === "block") !== (m[3] === "attacking")) return null;
    const test = { youControlMore: { type: m[2] === "creatures" ? "creature" : "land" } };
    return { affects: { scope: "self" }, [m[1] === "attack" ? "cantAttackUnlessDefender" : "cantBlockUnlessAttacker"]: test, text };
  }
  if (line === "~ can't attack or block.") return { affects: { scope: "self" }, restrictions: ["cant-attack", "cant-block"], text };
  // Restrictions keyed to the other creatures in combat (rules 508.1c, 509.1b):
  // "~ can't attack or block alone", "enchanted creature gets +3/+0 and can
  // only attack alone".
  if ((m = /^(~|Enchanted creature|Equipped creature)(?: gets ([+-]\d+)\/([+-]\d+) and)? (can.+)\.$/.exec(line))) {
    const restrictions = {
      "can't attack alone": ["cant-attack-alone"],
      "can't block alone": ["cant-block-alone"],
      "can't attack or block alone": ["cant-attack-alone", "cant-block-alone"],
      "can only attack alone": ["can-only-attack-alone"],
      "can't attack unless at least two other creatures attack": ["cant-attack-unless-two-others"],
      "can't block unless at least two other creatures block": ["cant-block-unless-two-others"],
    }[m[4]];
    if (restrictions !== undefined) {
      const bonus = m[2] === undefined ? {} : { grantPt: [Number(m[2]), Number(m[3])] };
      return { affects: { scope: m[1] === "~" ? "self" : "attached" }, ...bonus, restrictions, text };
    }
  }
  // Hazoret, Godseeker: "unless you have max speed" (rule 702.179e).
  if (line === "~ can't attack or block unless you have max speed.") {
    return { affects: { scope: "self" }, condition: { kind: "speed", atMost: 3 }, restrictions: ["cant-attack", "cant-block"], text };
  }
  // A permanent's own keywords and bonus — what "Max speed —" lines grant
  // (Burnout Bashtronaut, Gastal Raider, Walking Sarcophagus).
  if ((m = new RegExp(`^~ has ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return { affects: { scope: "self" }, grantKeywords: [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]), text };
  }
  if ((m = new RegExp(`^~ gets ([+-]\\d+)/([+-]\\d+)(?: and has ${KW}(?: and ${KW})?)?\\.$`, "i").exec(line))) {
    const kws = [m[3], m[4]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return { affects: { scope: "self" }, grantPt: [Number(m[1]), Number(m[2])], ...(kws.length ? { grantKeywords: kws } : {}), text };
  }
  if (line === "~ attacks each combat if able.") return { affects: { scope: "self" }, restrictions: ["must-attack"], text };
  // Rule 509.1c's requirement as a static; "attacks or blocks" is both, each
  // meeting only its own kind of combat.
  if (line === "~ blocks each combat if able.") return { affects: { scope: "self" }, restrictions: ["must-block"], text };
  if (line === "~ attacks or blocks each combat if able.") {
    return { affects: { scope: "self" }, restrictions: ["must-attack", "must-block"], text };
  }
  if (line === "All creatures block each combat if able.") return { affects: { scope: "all-creatures" }, restrictions: ["must-block"], text };
  // Requirements only the whole declaration can answer (rules 508.1d, 509.1c).
  if (line === "~ must be blocked by exactly one creature if able.") {
    return { affects: { scope: "self" }, restrictions: ["must-be-blocked-by-exactly-one"], text };
  }
  if ((m = /^(~|Equipped creature)(?: gets ([+-]\d+)\/([+-]\d+) and)? must be blocked by an? ([A-Z][a-z]+) if able\.$/.exec(line))) {
    return {
      affects: { scope: m[1] === "~" ? "self" : "attached" },
      ...(m[2] !== undefined ? { grantPt: [Number(m[2]), Number(m[3])] } : {}),
      mustBeBlockedBy: { by: { type: "creature", subtype: m[4] } },
      text,
    };
  }
  if ((m = /^All creatures with (flying|reach|defender) able to block ~ do so\.$/.exec(line))) {
    return { affects: { scope: "self" }, mustBeBlockedBy: { by: { type: "creature", keyword: m[1] }, all: true }, text };
  }
  if ((m = /^All ([A-Z][a-z]+)s able to block ~ do so\.$/.exec(line))) {
    return { affects: { scope: "self" }, mustBeBlockedBy: { by: { type: "creature", subtype: m[1] }, all: true }, text };
  }
  if (line === "If ~ attacks, all creatures you control attack if able.") {
    return { affects: { scope: "creatures-you-control" }, attacksIfAttacks: { isSource: true }, text };
  }
  if (line === "If a creature you control attacks, ~ also attacks if able.") {
    return { affects: { scope: "self" }, attacksIfAttacks: { type: "creature", controlledBy: "you" }, text };
  }
  // Boldwyr Intimidator: a rule over the two types, whoever controls them.
  if ((m = /^([A-Z][a-z]+)s can't block ([A-Z][a-z]+)s\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { type: "creature", subtype: m[2] } },
      cantBeBlockedBy: { subtype: m[1] },
      text,
    };
  }
  // Menace's restriction with a larger N (rules 702.111b, 509.1b).
  if ((m = /^(~|Each creature you control with menace) can't be blocked except by (two|three|four|five|six) or more creatures\.$/.exec(line))) {
    const n = { two: 2, three: 3, four: 4, five: 5, six: 6 }[m[2]];
    const affects =
      m[1] === "~" ? { scope: "self" } : { scope: "filter", filter: { type: "creature", controlledBy: "you", keyword: "menace" } };
    return { affects, blockedByAtLeast: n, text };
  }
  if (line === "~ can't be blocked unless defending player controls three or more creatures that share a creature type.") {
    const shared = { kind: "controls", filter: { type: "creature" }, atLeast: 3, sharingACreatureType: true };
    return {
      affects: { scope: "self" },
      condition: { kind: "of-player", player: "defending-player", condition: { kind: "not", of: shared } },
      grantKeywords: ["unblockable"],
      text,
    };
  }
  if (line === "~ can't be blocked unless all creatures defending player controls block it.") {
    return { affects: { scope: "self" }, blockedOnlyByAll: true, text };
  }
  if (line === "~ can't be blocked.") return { affects: { scope: "self" }, grantKeywords: ["unblockable"], text };
  if ((m = new RegExp(`^During your turn, ~ has ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    // Avatar Kyoshi's shape.
    return {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]),
      text,
    };
  }
  if (line === "~ can block only creatures with flying.") return { affects: { scope: "self" }, canBlockOnly: { keyword: "flying" }, text };
  // A Pilot's crew bonus (rules 702.122a, 702.171a): "~ [saddles Mounts and]
  // crews Vehicles as though its power were N greater" / "…using its
  // toughness rather than its power" — `crewsAs`, saddle only when it says so.
  if ((m = /^~ (saddles Mounts and )?crews Vehicles (?:as though its power were (\d+) greater|(using its toughness rather than its power))\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      crewsAs: { ...(m[2] ? { plus: Number(m[2]) } : { toughness: true }), ...(m[1] ? { saddles: true } : {}) },
      text,
    };
  }
  // Rule 305.7: lands whose land types are set to a basic one (Blood Moon,
  // Spreading Seas, Convincing Mirage).
  if ((m = /^Nonbasic lands are (Plains|Islands|Swamps|Mountains|Forests)\.$/.exec(line))) {
    const type = m[1] === "Plains" ? "Plains" : m[1].slice(0, -1);
    return { affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } }, setSubtypes: [type], text };
  }
  // A supertype in addition (layer 4, rule 613.1d): "enchanted creature is
  // legendary", "all nonland permanents are legendary", "permanents with ice
  // counters on them are snow", "lands you control and land cards in your
  // library are basic".
  if ((m = /^Enchanted (?:creature|land|permanent) is (legendary|snow)\.$/.exec(line))) {
    return { affects: { scope: "attached" }, addSupertypes: [m[1]], text };
  }
  if ((m = new RegExp(`^Enchanted creature is (legendary|snow), gets \\+(\\d+)/\\+(\\d+), and has ${KW}, ${KW}, and ${KW}\\.$`, "i").exec(line))) {
    return {
      affects: { scope: "attached" },
      addSupertypes: [m[1].toLowerCase()],
      grantPt: [Number(m[2]), Number(m[3])],
      grantKeywords: [m[4], m[5], m[6]].map((k) => KEYWORDS[k.toLowerCase()]),
      text,
    };
  }
  if ((m = /^All nonland permanents are (legendary|snow)\.$/.exec(line))) {
    return { affects: { scope: "filter", filter: { notTypes: ["land"] } }, addSupertypes: [m[1]], text };
  }
  if ((m = /^Permanents with (\w+) counters on them are (legendary|snow)\.$/.exec(line))) {
    return {
      affects: { scope: "filter", filter: { counters: { kind: m[1], compare: { op: "gte", n: 1 } } } },
      addSupertypes: [m[2]],
      text,
    };
  }
  if (line === "Lands you control and land cards in your library are basic.") {
    return {
      affects: { scope: "filter", filter: { type: "land", controlledBy: "you" } },
      addSupertypes: ["basic"],
      typesOutsideBattlefield: { ofType: "land", zones: ["library"], addSupertypes: ["basic"] },
      text,
    };
  }
  if ((m = /^Enchanted land is an? (Plains|Island|Swamp|Mountain|Forest)\.$/.exec(line))) {
    return { affects: { scope: "attached" }, setSubtypes: [m[1]], text };
  }
  if (line === "Enchanted land is the chosen type.") return { affects: { scope: "attached" }, setsChosenLandType: true, text };
  // "You may have ~ assign its combat damage as though it weren't blocked"
  // (Thorn Elemental; Wolverine's "his … he"), and an Aura's or Equipment's
  // "enchanted creature's controller may have it …" (Indomitable Might).
  if (/^You may have ~ assign (?:its|his|her|their) combat damage as though (?:it|he|she|they) weren't blocked\.$/.test(line)) {
    return { affects: { scope: "self" }, assignAsThoughUnblocked: true, text };
  }
  if (/^(?:Enchanted|Equipped) creature's controller may have it assign its combat damage as though it weren't blocked\.$/.test(line)) {
    return { affects: { scope: "attached" }, assignAsThoughUnblocked: true, text };
  }
  if ((m = /^~ can't be blocked by creatures with power (\d+) or (less|greater)\.$/.exec(line))) {
    return { affects: { scope: "self" }, cantBeBlockedBy: { power: { op: m[2] === "less" ? "lte" : "gte", n: Number(m[1]) } }, text };
  }
  if (line === "You have no maximum hand size.") return { affects: { scope: "self" }, noMaxHandSize: true, text };
  // "This Equipment can be attached only to a creature with power 3 or
  // greater" (O-Naginata, Gate Smasher — rule 301.5c).
  if ((m = /^~ can be attached only to a creature with (power|toughness) (\d+) or (greater|less)\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      attachOnlyTo: { type: "creature", [m[1]]: { op: m[3] === "greater" ? "gte" : "lte", n: Number(m[2]) } },
      text,
    };
  }
  // A flash permission (rule 601.3b): "You may cast spells as though they
  // had flash" (Heliod, the Warped Eclipse), every player's with "Any
  // player may cast creature and enchantment spells …" (Vernal Equinox —
  // `castAsThoughFlashAnyPlayer`), and "You may cast the first creature
  // spell you cast each turn as though it had flash" (The Blue Spirit —
  // `castAsThoughFlashFirstEachTurn`).
  if ((m = /^(You|Any player) may cast (?:(.+?) )?spells as though they had flash\.$/.exec(line))) {
    const filter = flashSpellsFilter(m[2]);
    if (filter !== null) {
      return {
        affects: { scope: "self" },
        castAsThoughFlash: filter,
        ...(m[1] === "Any player" ? { castAsThoughFlashAnyPlayer: true } : {}),
        text,
      };
    }
  }
  if ((m = /^You may cast the first (?:(.+?) )?spell you cast each turn as though it had flash\.$/.exec(line))) {
    const filter = flashSpellsFilter(m[1]);
    if (filter !== null) {
      return { affects: { scope: "self" }, castAsThoughFlash: filter, castAsThoughFlashFirstEachTurn: true, text };
    }
  }
  // Who sees what (`StaticAbility.visibility`): "your opponents play with
  // their hands revealed" (Telepathy), "players play with the top card of
  // their libraries revealed" (Wizened Snitches), "you may look at face-down
  // creatures you don't control any time" (Keeper of the Lens).
  if ((m = /^(Your opponents|Players) play with their hands revealed\.$/.exec(line))) {
    return { affects: { scope: "self" }, visibility: { handsRevealed: m[1] === "Players" ? "each-player" : "opponents" }, text };
  }
  if (line === "Play with your hand revealed.") {
    return { affects: { scope: "self" }, visibility: { handsRevealed: "you" }, text };
  }
  if ((m = /^(Your opponents|Players) play with the top card of their libraries revealed\.$/.exec(line))) {
    return { affects: { scope: "self" }, visibility: { libraryTopRevealed: m[1] === "Players" ? "each-player" : "opponents" }, text };
  }
  if (/^You may look at face-down creatures (?:you don't control|your opponents control) any time\.$/.test(line)) {
    return { affects: { scope: "self" }, visibility: { looksAtFaceDownCreatures: true }, text };
  }
  // A static step skip (rule 614.10): "skip your draw step", "players skip
  // their untap steps", "each player skips their untap step".
  if ((m = /^(Skip your|Players skip their|Each player skips their|Your opponents skip their|Each opponent skips their) (untap|upkeep|draw) steps?\.$/.exec(line))) {
    const who = m[1] === "Skip your" ? "you" : /opponent/.test(m[1]) ? "opponents" : "each-player";
    return { affects: { scope: "self" }, skipsSteps: { who, steps: [m[2]] }, text };
  }
  // A limit on what a player untaps in their untap step (rule 502.3): "players
  // can't untap more than one land during their untap steps".
  if ((m = /^(Players|You|Your opponents) can't untap more than (one|two|three|four|five) (.+?) during (?:their|your) untap steps?\.$/.exec(line))) {
    const who = m[1] === "You" ? "you" : m[1] === "Players" ? "each-player" : "opponents";
    const noun = m[3].replace(/^nonbasic /, "");
    const filter = /^permanents?$/.test(noun) ? {} : parseTypePhrase(noun);
    if (filter !== null) {
      const of = { ...filter, ...(noun !== m[3] ? { notSupertype: "basic" } : {}) };
      const onWhat = Object.keys(of).length > 0 ? { filter: of } : {};
      return { affects: { scope: "self" }, untapLimit: { who, count: NUMBERS[m[2]], ...onWhat }, text };
    }
  }
  // Storage Matrix, whose "as long as" is a leading condition (above).
  if (line === "Each player chooses artifact, creature, or land during their untap step. That player can untap only permanents of the chosen type this step.") {
    return { affects: { scope: "self" }, untapOnlyChosenType: { who: "each-player", types: ["artifact", "creature", "land"] }, text };
  }
  // Booby Trap's "the chosen player reveals each card they draw".
  if (line === "The chosen player reveals each card they draw.") {
    return { affects: { scope: "self" }, revealsDraws: "chosen-player", text };
  }
  // Cursed Rack's "the chosen player's maximum hand size is four".
  if ((m = new RegExp(`^The chosen player's maximum hand size is ${N}\\.$`).exec(line)) && typeof numberOf(m[1]) === "number") {
    return { affects: { scope: "self" }, maxHandSize: { who: "chosen-player", set: numberOf(m[1]) }, text };
  }
  // Devotion (rule 700.5). A Theros God's "as long as your devotion to white
  // [and black] is less than N, ~ isn't a creature" (`godDevotion`), a
  // Demigod's "~'s power is equal to your devotion to red" (a CDA), and Altar
  // of the Pantheon's "increased by one".
  if ((m = new RegExp(`^As long as your devotion to ${DEVOTION} is less than ${N}, ~ isn't a creature\\.$`).exec(line))) {
    const n = numberOf(m[3]);
    if (typeof n === "number") return godDevotion(devotionColors(m[1], m[2]), n, text);
  }
  if ((m = new RegExp(`^~'s power is equal to your devotion to ${DEVOTION}\\.$`).exec(line))) {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: devotionColors(m[1], m[2]) }, plusPower: 0, plusToughness: 0, only: "power" },
      text,
    };
  }
  // Domain (an ability word, rule 207.2c): Nishoba Brawler's "~'s power is
  // equal to the number of basic land types among lands you control" (a CDA).
  if (line === "~'s power is equal to the number of basic land types among lands you control.") {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { basicLandTypes: "you" }, plusPower: 0, plusToughness: 0, only: "power" },
      text,
    };
  }
  // A count of different names (a `distinct` aggregate) as a CDA: Awakened
  // Amalgam's "… the number of differently named lands you control".
  if ((m = /^~'s power and toughness are each equal to the number of differently named (.+?) you control\.$/.exec(line))) {
    const filter = parseTypePhrase(m[1]);
    if (filter !== null && Object.keys(filter).length > 0) {
      return {
        affects: { scope: "self" },
        setBasePtFromCount: {
          countOf: { aggregate: "distinct", of: "name", filter: { ...filter, controlledBy: "you" } },
          plusPower: 0,
          plusToughness: 0,
        },
        text,
      };
    }
  }
  // "~ gets +2/+0 for each Equipment attached to it" (Goblin Gaveleer): the
  // Equipment whose host is the source itself.
  if ((m = /^~ gets ([+-]\d+)\/([+-]\d+) for each (Aura|Equipment) attached to (?:it|~)\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: m[3], attachedTo: { isSource: true } }, pt: [Number(m[1]), Number(m[2])] },
      text,
    };
  }
  // A CDA or a count-scaled bonus read from the chosen player's side
  // (`forChosenPlayer`, beside `choosePlayerOnEnter`): Lost Order of
  // Jarkeld's "~'s power and toughness are each equal to 1 plus the number of
  // creatures the chosen player controls", Entropic Specter's "… the number
  // of cards in the chosen player's hand", Nyxathid's "~ gets -1/-1 for each
  // card in the chosen player's hand".
  if ((m = /^~'s power and toughness are each equal to (?:(\w+) plus )?the number of (.+?) the chosen player controls\.$/.exec(line))) {
    const plus = m[1] === undefined ? 0 : numberOf(m[1]);
    const filter = parseTypePhrase(m[2]);
    if (typeof plus === "number" && filter !== null && Object.keys(filter).length > 0) {
      return {
        affects: { scope: "self" },
        setBasePtFromCount: {
          countOf: { countOf: { ...filter, controlledBy: "you" } },
          plusPower: plus,
          plusToughness: plus,
          forChosenPlayer: true,
        },
        text,
      };
    }
  }
  if (line === "~'s power and toughness are each equal to the number of cards in the chosen player's hand.") {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-your-hand", plusPower: 0, plusToughness: 0, forChosenPlayer: true },
      text,
    };
  }
  if ((m = /^~ gets ([+-]\d+)\/([+-]\d+) for each card in the chosen player's hand\.$/.exec(line))) {
    return {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, forChosenPlayer: true, pt: [Number(m[1]), Number(m[2])] },
      text,
    };
  }
  // A bonus scaled by a hand size or a life total (`grantPtPerCount`'s
  // `cardsInHand` and `lifeTotal`): Grim Strider's "~ gets -1/-1 for each
  // card in your hand", Righteous Authority's "enchanted creature gets
  // +1/+1 for each card in its controller's hand", Enemy of Enlightenment's
  // "… in your opponents' hands", Death's Shadow's "~ gets -X/-X, where X is
  // your life total", Meishin's "all creatures get -X/-0, where X is the
  // number of cards in your hand".
  {
    const subject = "(~|Enchanted creature|Equipped creature|All creatures|Creatures you control)";
    const hands = { "your hand": true, "your opponents' hands": "opponents", "its controller's hand": "affected-controller" };
    const affectsOf = (s) =>
      s === "~"
        ? { scope: "self" }
        : s === "All creatures"
          ? { scope: "all-creatures" }
          : s === "Creatures you control"
            ? { scope: "creatures-you-control" }
            : { scope: "attached" };
    const per = new RegExp(`^${subject} gets? ([+-]\\d+)/([+-]\\d+) for each card in (your hand|your opponents' hands|its controller's hand)\\.$`).exec(line);
    if (per !== null) {
      return { affects: affectsOf(per[1]), grantPtPerCount: { cardsInHand: hands[per[4]], pt: [Number(per[2]), Number(per[3])] }, text };
    }
    const x = new RegExp(`^${subject} gets? ([+-])X/([+-])(X|0), where X is (your life total|the number of cards in your hand)\\.$`).exec(line);
    if (x !== null) {
      const sign = (s) => (s === "-" ? -1 : 1);
      const pt = [sign(x[2]), x[4] === "0" ? 0 : sign(x[3])];
      const count = x[5] === "your life total" ? { lifeTotal: true } : { cardsInHand: true };
      return { affects: affectsOf(x[1]), grantPtPerCount: { ...count, pt }, text };
    }
  }
  // Shapeshifter's "*/7-*" (a CDA, rule 604.3): the number it last chose.
  const lastChosen = /^~'s power is equal to the last chosen number and its toughness is equal to (\d+) minus that number\.$/.exec(line);
  if (lastChosen !== null) {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: "chosen-number",
        plusPower: 0,
        plusToughness: Number(lastChosen[1]),
        toughnessMinusCount: true,
      },
      text,
    };
  }
  // Serra Avatar's "~'s power and toughness are each equal to your life
  // total" — a CDA (rule 604.3).
  if (line === "~'s power and toughness are each equal to your life total.") {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "your-life-total", plusPower: 0, plusToughness: 0 },
      text,
    };
  }
  // Party (rule 700.8): Archpriest of Iona's CDA.
  if (line === "~'s power is equal to the number of creatures in your party.") {
    return {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { partySize: "you" }, plusPower: 0, plusToughness: 0, only: "power" },
      text,
    };
  }
  // Arixmethes' "as long as ~ has a slumber counter on it, it's a land" — its
  // card types replaced while it does (rule 205.1a).
  if ((m = new RegExp(`^As long as ~ has an? ([a-z]+) counter on it, it's an? (${CARD_TYPES.join("|")})\\.$`).exec(line))) {
    return {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: m[1], compare: { op: "gte", n: 1 } },
      setTypes: [m[2]],
      text,
    };
  }
  if (line === "Your devotion to each color and each combination of colors is increased by one.") {
    return { affects: { scope: "self" }, devotionBonus: 1, text };
  }
  if ((m = /^(Other )?creatures you control get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return { affects: { scope: "creatures-you-control", ...(m[1] ? { excludeSelf: true } : {}) }, grantPt: [Number(m[2]), Number(m[3])], text };
  }
  if ((m = /^Other ([A-Z][a-z]+) creatures you control get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return { affects: { scope: "creatures-you-control", excludeSelf: true, subtype: m[1] }, grantPt: [Number(m[2]), Number(m[3])], text };
  }
  // "Creatures you control of the chosen type get +1/+1" (Patchwork Banner,
  // Icon of Ancestry) — the type chosen as it entered (`ofChosenType`).
  if ((m = /^(Other c|C)reatures you control of the chosen type get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
        ...(m[1] === "Other c" ? { excludeSelf: true } : {}),
      },
      grantPt: [Number(m[2]), Number(m[3])],
      text,
    };
  }
  // "Each other creature you control of the chosen type enters with an
  // additional +1/+1 counter on it" (Metallic Mimic).
  if (line === "Each other creature you control of the chosen type enters with an additional +1/+1 counter on it.") {
    return {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you", ofChosenType: true },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text,
    };
  }
  // "… for each land that entered the battlefield under your control this
  // turn" (Bioengineered Future): the turn history's list, ones gone included.
  if (line === "Each creature you control enters with an additional +1/+1 counter on it for each land that entered the battlefield under your control this turn.") {
    return {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { turnHistory: "entered", filter: { type: "land" } } },
      },
      text,
    };
  }
  // "If a triggered ability of another creature you control of the chosen
  // type triggers, it triggers an additional time" (Roaming Throne).
  if (line === "If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.") {
    return {
      affects: { scope: "self" },
      doubleTriggersOf: { filter: { type: "creature", controlledBy: "you", ofChosenType: true }, others: true },
      text,
    };
  }
  // "Creatures your opponents control lose flying and can't have or gain
  // flying" (the Archetypes): `cantHaveKeywords` already covers the "lose".
  if (
    (m = new RegExp(`^creatures your opponents control lose ${KW} and can't have or gain ${KW}\\.$`, "i").exec(line)) &&
    m[1].toLowerCase() === m[2].toLowerCase()
  ) {
    return {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      cantHaveKeywords: [KEYWORDS[m[1].toLowerCase()]],
      text,
    };
  }
  if ((m = new RegExp(`^(Other )?creatures you control have ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return {
      affects: { scope: "creatures-you-control", ...(m[1] ? { excludeSelf: true } : {}) },
      grantKeywords: [m[2], m[3]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]),
      text,
    };
  }
  // "Bands with other legendary creatures" (rule 702.22b) for the
  // creatures of one colour you control — the Legends lands.
  if ((m = /^(White|Blue|Black|Red|Green) legendary creatures you control have "bands with other legendary creatures\."$/.exec(line))) {
    const color = { White: "W", Blue: "U", Black: "B", Red: "R", Green: "G" }[m[1]];
    return {
      affects: { scope: "filter", filter: { type: "creature", supertype: "legendary", colors: [color], controlledBy: "you" } },
      bandsWithOther: { type: "creature", supertype: "legendary" },
      text,
    };
  }
  // Soulbond's pairing statics (rule 702.95b): "both creatures have …",
  // "each of those creatures gets …" — the `paired` scope.
  if ((m = new RegExp(`^As long as (?:~|this creature) is paired with another creature, both creatures have ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return { affects: { scope: "paired" }, grantKeywords: [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]), text };
  }
  if ((m = /^As long as (?:~|this creature) is paired with another creature, each of those creatures gets ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    return { affects: { scope: "paired" }, grantPt: [Number(m[1]), Number(m[2])], text };
  }
  // "The chosen creature gets +3/+3 and has flying" (Tyrannical Pitlord —
  // `choosePermanentOnEnter`).
  if ((m = new RegExp(`^The chosen creature gets ([+-]\\d+)/([+-]\\d+)(?: and has ${KW}(?: and ${KW})?)?\\.$`, "i").exec(line))) {
    const kws = [m[3], m[4]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return { affects: { scope: "chosen" }, grantPt: [Number(m[1]), Number(m[2])], ...(kws.length ? { grantKeywords: kws } : {}), text };
  }
  // "Creatures that share a color with equipped creature get +1/+1" (Konda's
  // Banner): a live read of the host.
  if ((m = /^Creatures that share a (color|creature type) with (?:equipped|enchanted) creature get ([+-]\d+)\/([+-]\d+)\.$/.exec(line))) {
    const clause = m[1] === "color" ? { sharesColorWithHost: true } : { sharesCreatureTypeWithHost: true };
    return { affects: { scope: "filter", filter: { type: "creature", ...clause } }, grantPt: [Number(m[2]), Number(m[3])], text };
  }
  // "As long as another Aura is attached to enchanted creature, it has first
  // strike and lifelink" (Face of Divinity).
  if ((m = new RegExp(`^As long as another Aura is attached to enchanted creature, it has ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    const kws = [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { attachments: { filter: { subtype: "Aura" }, otherThanSource: true } } } },
      grantKeywords: kws,
      text,
    };
  }
  if ((m = new RegExp(`^(?:Equipped|Enchanted) creature gets ([+-]\\d+)/([+-]\\d+)(?: and has ${KW}(?: and ${KW})?)?\\.$`, "i").exec(line))) {
    const kws = [m[3], m[4]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return { affects: { scope: "attached" }, grantPt: [Number(m[1]), Number(m[2])], ...(kws.length ? { grantKeywords: kws } : {}), text };
  }
  // "… and has protection from each color that's not in your commander's color
  // identity" (Commander's Plate): worked out as it applies.
  if ((m = /^(?:Equipped|Enchanted) creature gets ([+-]\d+)\/([+-]\d+) and has protection from each color that's not in your commander's color identity\.$/.exec(line))) {
    return { affects: { scope: "attached" }, grantPt: [Number(m[1]), Number(m[2])], protection: { outsideCommanderIdentity: true }, text };
  }
  // A static granting a static (`grantsStatic` — rule 613.1f): "Equipped
  // creature has [flying and] 'You can't lose the game …'" (Cloudsteel
  // Kirin), "Commander creatures you own have 'Creature tokens you control
  // get +2/+2'" (Inspiring Leader), "All Sliver creatures have 'This creature
  // gets +1/+1 as long as you control a Swamp'" (Sedge Sliver). The quoted
  // line is read as a static of the object that has it.
  if ((m = new RegExp(`^(Equipped creature|Enchanted creature|Commander creatures you own|All Sliver creatures|Creatures you control|Creatures you control with flying|Creatures and enchantments you control|Planeswalkers you control) (?:has|have) (?:${KW} and )?"([^"]+\\.)"$`).exec(line))) {
    const affects = {
      "Equipped creature": { scope: "attached" },
      "Enchanted creature": { scope: "attached" },
      "Commander creatures you own": { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      "All Sliver creatures": { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      "Creatures you control": { scope: "creatures-you-control" },
      "Creatures you control with flying": { scope: "filter", filter: { type: "creature", keyword: "flying", controlledBy: "you" } },
      "Creatures and enchantments you control": { scope: "filter", filter: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" } },
      "Planeswalkers you control": { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
    }[m[1]];
    const quoted = m[3];
    const granted = parseGrantedStatic(quoted);
    if (granted !== null && granted.grantsStatic === undefined && !hasLayerFourPartOf(granted)) {
      // Its text as printed ("This creature …"), not as normalized.
      const printed = /"([^"]+\.)"$/.exec(text)?.[1] ?? quoted;
      return {
        affects,
        ...(m[2] !== undefined ? { grantKeywords: [KEYWORDS[m[2].toLowerCase()]] } : {}),
        grantsStatic: [{ ...granted, text: printed }],
        text,
      };
    }
  }
  if ((m = new RegExp(`^(?:Equipped|Enchanted) creature has ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return { affects: { scope: "attached" }, grantKeywords: [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]), text };
  }
  if ((m = /^(?:Enchanted|Equipped) creature can't attack or block\.$/.exec(line))) {
    return { affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text };
  }
  // "…, or crew Vehicles" (rule 702.122d — Revoke Privileges).
  if (/^Enchanted (?:creature|permanent) can't attack, block, or crew Vehicles\.$/.test(line)) {
    return { affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block", "cant-crew"], text };
  }
  // Arrest's "…, and its activated abilities can't be activated" — the
  // host's abilities, for every player (`hostOfSource`); "unless they're
  // mana abilities" (Faith's Fetters) and "with {T} in their costs" (Serra
  // Bestiary) narrow it.
  if (
    (m = /^Enchanted (creature|permanent) can't attack or block, and its activated abilities (with \{T\} in their costs )?can't be activated( unless they're mana abilities)?\.$/.exec(
      line,
    ))
  ) {
    return {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: {
        who: "each-player",
        abilitiesOf: { hostOfSource: true },
        ...(m[3] !== undefined ? { exceptManaAbilities: true } : {}),
        ...(m[2] !== undefined ? { onlyTapAbilities: true } : {}),
      },
      text,
    };
  }
  // "Enchanted creature doesn't untap during its controller's untap step"
  // (rule 502.3 — Tractor Beam, Watery Grasp).
  if (/^(?:Enchanted|Equipped) (?:creature|permanent|land|artifact) doesn't untap during its controller's untap step\.$/.test(line)) {
    return { affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text };
  }
  // "Can't be turned face up" (rule 708.7 — the `cant-turn-face-up`
  // restriction): Unable to Scream's "as long as enchanted creature is face
  // down, it can't be turned face up" (only a face-down one could be),
  // Karlov Watchdog's "permanents your opponents control can't be turned
  // face up during your turn".
  if (/^As long as enchanted creature is face down, it can't be turned face up\.$/.test(line)) {
    return { affects: { scope: "attached" }, restrictions: ["cant-turn-face-up"], text };
  }
  if (/^Permanents your opponents control can't be turned face up during your turn\.$/.test(line)) {
    return {
      affects: { scope: "filter", filter: { controlledBy: "opponent" } },
      restrictions: ["cant-turn-face-up"],
      condition: { kind: "your-turn" },
      text,
    };
  }
  return null;
}

const partnerWithAbility = (name) => ({
  trigger: { on: "enters-battlefield", who: "self" },
  targets: ["player"],
  // "Target player **may** search" is that player's choice (the
  // `partnerWithTrigger` helper's shape).
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    prompt: `Search your library for a card named ${name}?`,
    effect: { kind: "search-library", filter: { name }, destination: "hand", min: 0, max: 1, reveal: true },
  },
  resolve: null,
  text: `When this creature enters, target player may search their library for a card named ${name}, reveal it, put it into their hand, then shuffle.`,
});

const wardAbility = (cost) => ({
  trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
  targets: [],
  effect: { kind: "ward", cost },
  resolve: null,
  text: cost.mana ? `Ward ${cost.mana}` : `Ward—Pay ${cost.payLife} life.`,
});

// Impending's two battlefield abilities (rule 702.176a) — helpers.ts's
// `impendingAbilities()`, written out, since a scaffold is plain data.
const IMPENDING_STATIC = {
  affects: { scope: "self" },
  condition: { kind: "impending" },
  removeTypes: ["creature"],
  text: "As long as this permanent's impending cost was paid and it has a time counter on it, it isn't a creature.",
};
const IMPENDING_TRIGGER = {
  trigger: { on: "step-begins", step: "end", who: "you" },
  condition: { kind: "impending" },
  targets: [],
  effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
  resolve: null,
  text: "At the beginning of your end step, if this permanent's impending cost was paid and it has a time counter on it, remove a time counter from it.",
};

// ------------------------------------------------------------- serializer

const IDENT = /^[A-Za-z_$][\w$]*$/;

/**
 * Plain data as TypeScript source the way the pool writes it: identifier
 * keys bare, short objects on one line, and an ability's `__todo` / `__hint`
 * printed as comments where they belong.
 */
export function toSource(value, indent = "") {
  const inner = `${indent}  `;
  if (value === null) return "null";
  // A chosen name's, colour's, card type's or counter's placeholder, as a
  // hand-authored card writes it (the scaffold imports it).
  if (typeof value === "string" && Object.hasOwn(CHOSEN_CONSTANTS, value)) return CHOSEN_CONSTANTS[value];
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value !== "object") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const flat = `[${value.map((v) => toSource(v, inner)).join(", ")}]`;
    if (!flat.includes("\n") && flat.length + indent.length < 96) return flat;
    return `[\n${value.map((v) => `${inner}${toSource(v, inner)},`).join("\n")}\n${indent}]`;
  }
  const entries = Object.entries(value).filter(([k, v]) => v !== undefined && !k.startsWith("__"));
  const comments = [
    ...(value.__todo ?? []).map((t) => `${inner}// TODO(scaffold): ${t}`),
    ...(value.__hint ?? []).map((h) => `${inner}// parsed "${h.sentence}" as ${toSource(h.effect, inner).replace(/\n\s*/g, " ")}`),
  ];
  const key = (k) => (IDENT.test(k) ? k : JSON.stringify(k));
  const flat = `{ ${entries.map(([k, v]) => `${key(k)}: ${toSource(v, inner)}`).join(", ")} }`;
  if (comments.length === 0 && !flat.includes("\n") && flat.length + indent.length < 96) return entries.length ? flat : "{}";
  return `{\n${entries.map(([k, v]) => `${inner}${key(k)}: ${toSource(v, inner)},`).join("\n")}${comments.length ? `\n${comments.join("\n")}` : ""}\n${indent}}`;
}
