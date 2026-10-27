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
  surge,
  undying,
  unearth,
  vanishing,
} from "../dist/cards/helpers.js";

// ------------------------------------------------------------------ text

const NUMBERS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const N = "(a|an|one|two|three|four|five|six|seven|eight|nine|ten|x|\\d+)";
const numberOf = (word) => {
  const w = word.toLowerCase();
  if (w === "x") return "x";
  if (/^\d+$/.test(w)) return Number(w);
  return NUMBERS[w];
};

export const stripReminder = (line) => line.replace(/\s*\([^)]*\)/g, "").trim();

/** The line as the templates read it: reminder text gone, the card's own name
 * (and its short name, "Kibo" for "Kibo, Uktabi Prince") and "this creature" /
 * "this artifact" / … all written "~". */
export function normalize(line, faceName) {
  let s = stripReminder(line);
  s = s.split(faceName).join("~");
  const short = faceName.split(",")[0];
  if (short !== faceName && short.length >= 3) s = s.replace(new RegExp(`\\b${escapeRe(short)}\\b`, "g"), "~");
  s = s.replace(/\bthis (creature|artifact|enchantment|land|permanent|Equipment|Vehicle|Aura|token|spell|card|Saga)\b/gi, "~");
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
  horsemanship: "horsemanship",
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
    cascade: () => ({
      triggered: [{ trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" }],
    }),
    convoke: () => ({ card: { convoke: true } }),
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
  const m = /^protection from (\w+)(?: and from (\w+))?$/i.exec(part);
  if (m === null) return null;
  const words = [m[1], m[2]].filter(Boolean).map((w) => w.toLowerCase());
  const text = part.charAt(0).toUpperCase() + part.slice(1);
  if (words.length === 1 && words[0] === "multicolored") {
    return { affects: { scope: "self" }, protection: { filter: { multicolored: true } }, text };
  }
  if (!words.every((w) => COLOR_WORD[w] !== undefined)) return null;
  return { affects: { scope: "self" }, protection: { colors: words.map((w) => COLOR_WORD[w]) }, text };
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
    if (w === "nontoken") filter.token = false;
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

// --------------------------------------------------------------- targets

/** Target phrases, longest first, as the engine's target specs. */
const TARGET_PHRASES = [
  ["target creature or planeswalker an opponent controls", { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  ["target creature or planeswalker", { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  ["target nonland permanent an opponent controls", "nonland-permanent-an-opponent-controls"],
  ["target nonland permanent you don't control", "nonland-permanent-an-opponent-controls"],
  ["target nonland permanent you control", { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } }],
  ["target creature an opponent controls", "creature-an-opponent-controls"],
  ["target creature you don't control", "creature-an-opponent-controls"],
  ["target artifact an opponent controls", "artifact-an-opponent-controls"],
  ["target artifact you don't control", "artifact-an-opponent-controls"],
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
  ["target creature", "creature"],
  ["target artifact", "artifact"],
  ["target enchantment", "enchantment"],
  ["target land", "land"],
  ["target permanent or player", "permanent-or-player"],
  ["target permanent you control", { kind: "permanent", whose: "you", filter: {} }],
  ["target permanent", "permanent"],
  ["target player or planeswalker", "player-or-planeswalker"],
  ["target opponent or planeswalker", "opponent-or-planeswalker"],
  ["target player", "player"],
  ["target opponent", "opponent"],
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
      "(?: with (flying|reach|power (\\d+) or (greater|less)|toughness (\\d+) or (greater|less)|mana value (\\d+) or (greater|less)))?$",
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
  const whose = m[2] === undefined ? undefined : m[2].toLowerCase() === "you control" ? "you" : "opponent";
  return { kind: "permanent", ...(whose !== undefined ? { whose } : {}), filter };
}
const targetOf = (phrase) =>
  TARGET_PHRASES.find(([p]) => p === phrase.toLowerCase())?.[1] ?? modifiedTargetOf(phrase.toLowerCase());

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
const TARGET = `(?:${TARGET_PHRASES.map(([p]) => escapeRe(p)).join("|")}|target [a-z' ]+?(?: with (?:flying|reach|(?:power|toughness|mana value) \\d+ or (?:greater|less)))?)`;

/** "target creature card from your graveyard" and friends. */
function graveyardTargetOf(phrase) {
  const m = /^target (?:(.+?) )?card from (your|a|an opponent's) graveyard$/i.exec(phrase);
  if (!m) return undefined;
  const filter = m[1] === undefined ? {} : parseTypePhrase(m[1], { cards: true });
  if (filter === null) return undefined;
  const whose = m[2] === "your" ? "you" : m[2] === "a" ? "any" : "opponent";
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

/** A morph cost that isn't mana, as `MorphCost.also` — one part, never one
 * that reveals ("Morph—Reveal a blue card in your hand" isn't modeled). */
function morphNonManaCost(text) {
  let m;
  if ((m = /^Pay (\d+) life$/.exec(text))) return { payLife: Number(m[1]) };
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

export function parseCost(text) {
  const cost = { mana: null, tap: false };
  const extra = {};
  for (const part of text.split(/,\s*/)) {
    let m;
    if (MANA.test(part)) cost.mana = part;
    else if (part === "{T}") cost.tap = true;
    // {Q}, the untap symbol (rule 107.6).
    else if (part === "{Q}") cost.untap = true;
    else if (part === "Sacrifice ~") cost.sacrifice = "self";
    else if ((m = /^Sacrifice (a|an|another) (.+)$/.exec(part))) {
      const filter = parseTypePhrase(m[2]);
      if (filter === null) return null;
      cost.sacrifice = Object.keys(filter).length === 1 && filter.type === "creature" ? "creature-you-control" : { filter };
      if (m[1] === "another") extra.otherOnly = true;
    } else if ((m = /^Pay (\d+) life$/.exec(part))) cost.payLife = Number(m[1]);
    else if (part === "Discard your hand") cost.discardHand = true;
    // "Discard a card at random" (Mage il-Vec): nothing to choose.
    else if (part === "Discard a card at random") cost.discard = { count: 1, random: true };
    else if ((m = /^Remove (?:X|any number of) ([+-]\d+\/[+-]\d+|\w+) counters from ~$/i.exec(part))) {
      // X announced as it's activated (rules 601.2b, 602.2b), 0 allowed.
      cost.removeCounter = { kind: m[1], count: "x" };
    } else if ((m = new RegExp(`^Remove ${N} ([+-]\\d+/[+-]\\d+|\\w+) counters? from ~$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      cost.removeCounter = { kind: m[2], count };
    } else if ((m = /^(\{E\})+$/.exec(part))) cost.payEnergy = part.length / 3;
    else if ((m = new RegExp(`^Tap ${N} untapped (.+?) you control$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      const filter = parseTypePhrase(m[2]);
      if (typeof count !== "number" || filter === null) return null;
      cost.tapOthers = { count, filter: { ...filter, controlledBy: "you" } };
    } else if (part === "Exile ~ from your graveyard") extra.zone = "graveyard";
    else if (part === "Discard ~") extra.zone = "hand";
    else if (part === "Exile ~") cost.exileSelf = true;
    // "Exile the top card of your library" (Royal Herbalist), "the top two
    // cards" (Whirling Catapult).
    else if (part === "Exile the top card of your library") cost.exileTop = 1;
    else if ((m = new RegExp(`^Exile the top ${N} cards of your library$`, "i").exec(part))) {
      const count = numberOf(m[1]);
      if (typeof count !== "number") return null;
      cost.exileTop = count;
    }
    // "Exert this creature" as a cost (rule 701.43 — Steward of Solidarity).
    else if (part === "Exert ~") cost.exertSelf = true;
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
  if (cost.tapOthers !== undefined && !cost.tap) cost.tapOthers = { ...cost.tapOthers, includeSelf: true };
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
  if (/^When(?:ever)? ~ enters$/.test(c)) return self("enters-battlefield");
  if (/^When(?:ever)? ~ enters or attacks$/.test(c)) return [...self("enters-battlefield"), ...self("attacks")];
  if (/^When(?:ever)? ~ dies$/.test(c)) return self("dies");
  if (/^When(?:ever)? ~ leaves the battlefield$/.test(c)) return self("leaves-battlefield");
  if (/^Whenever ~ attacks$/.test(c)) return self("attacks");
  if (/^Whenever ~ blocks$/.test(c)) return self("blocks");
  if (/^Whenever ~ becomes blocked$/.test(c)) return self("becomes-blocked");
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
  // The renowned designation (rule 702.112b) becoming true.
  if (/^When(?:ever)? ~ becomes renowned$/.test(c)) return self("becomes-renowned");
  if (/^Whenever a creature you control becomes renowned$/.test(c)) return [{ on: "becomes-renowned", who: "you-control", filter: { type: "creature" } }];
  // A saddled designation (rule 702.171b) becoming true: "for the first time
  // each turn" only when it wasn't saddled already.
  if ((m = /^Whenever ~ becomes saddled( for the first time each turn)?$/.exec(c))) {
    return [{ on: "becomes-saddled", who: "self", ...(m[1] ? { firstTimeEachTurn: true } : {}) }];
  }
  if (/^Whenever ~ deals combat damage to a player$|^Whenever ~ deals combat damage to an opponent$/.test(c)) {
    return self("deals-combat-damage-to-player");
  }
  if (/^Whenever ~ deals combat damage to a player or battle$/.test(c)) {
    return [{ on: "deals-combat-damage-to-player", who: "self", orBattle: true }];
  }
  if (/^Whenever ~ is dealt damage$/.test(c)) return self("dealt-damage");
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
  if (
    (m =
      /^Whenever (a|an|another) (.+?)(?: (you control|an opponent controls))? (enters|dies|attacks|leaves the battlefield|is put into a graveyard from the battlefield)$/.exec(
        c,
      ))
  ) {
    let filter = parseTypePhrase(m[2]);
    if (filter === null) return null;
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
  if ((m = /^Whenever (you|an opponent|a player) casts? (a|an|your first|their first) (?:(.+?) )?spell(?: each turn)?$/.exec(c))) {
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
  if (/^Whenever you surveil$/.test(c)) return [{ on: "surveils", who: "you" }];

  // Steps.
  if (/^At the beginning of combat on your turn$/.test(c)) return [{ on: "step-begins", step: "begin-combat", who: "you" }];
  if (/^At the beginning of each combat$/.test(c)) return [{ on: "step-begins", step: "begin-combat", who: "any" }];
  if ((m = /^At the beginning of (your|each of your|each|the|each opponent's|each player's|enchanted player's) (upkeep|draw step|end step|precombat main phase|first main phase|postcombat main phases?)$/.exec(c))) {
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

export function parseSentence(sentence, ctx) {
  const s = sentence.replace(/\s+/g, " ").trim();
  // "…, where X is the number of …" / "for each …" define an amount by a rule
  // of their own; no template reads one, and matching the rest would take the
  // X for a cast-time X.
  // The one exception: "for each … counter removed this way", which is the
  // cost's X (`removeCounter.count: "x"`), read by the mana templates below.
  if (/\bwhere X\b|\bfor each\b/i.test(s) && !/^add .*for each [\w+/-]+ counter removed this way\.$/i.test(s)) return null;
  let m;
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
    const triggers = parseTrigger(clause);
    if (triggers === null || triggers.length !== 1) return null;
    const inner = { ...ctx, spell: false, targets: [], it: itOf(triggers), departed: departedOf(triggers) };
    inner.target = (spec) => inner.targets.push(spec) - 1;
    const effectText = `${m[3].charAt(0).toUpperCase()}${m[3].slice(1)}.`;
    const effect = parseSentence(effectText, inner);
    if (effect === null || containsUndefined(effect)) return null;
    // "Whenever ~ deals combat damage to a player" this turn is the older
    // `dealsCombatDamage` watch on the source (Lyra, Tolarian Archangel).
    const ownCombatDamage =
      triggers[0].on === "deals-combat-damage-to-player" && triggers[0].who === "self" && Object.keys(triggers[0]).length === 2;
    if (ownCombatDamage && inner.targets.length === 0 && !/^until your next turn$/i.test(m[1])) {
      return { kind: "delayed-trigger", at: { dealsCombatDamage: "source" }, effect, text: `${clause}${m[1] === "" ? " this turn" : ""}, ${m[3]}.` };
    }
    return {
      kind: "delayed-trigger",
      at: {
        whenever: triggers[0],
        ...(/^until your next turn$/i.test(m[1]) ? { until: "your-next-turn" } : {}),
        ...(inner.targets.length > 0 ? { targets: inner.targets } : {}),
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
  const re = (src) => new RegExp(`^${src}\\.$`, "i");
  const amount = (w) => numberOf(w);
  const slot = (phrase) => {
    const spec = targetOf(phrase) ?? graveyardTargetOf(phrase);
    return spec === undefined ? undefined : ctx.target(spec);
  };

  // Cards.
  if ((m = re(`(?:you )?draw ${N} cards?`).exec(s))) return { kind: "draw", amount: amount(m[1]) };
  if ((m = re(`(target player|target opponent) draws ${N} cards?`).exec(s))) {
    return { kind: "draw", amount: amount(m[2]), target: slot(m[1]) };
  }
  if ((m = re(`each player draws ${N} cards?`).exec(s))) return { kind: "draw", amount: amount(m[1]), who: "each-player" };
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
  if ((m = re(`(target player|target opponent) discards ${N} cards?`).exec(s))) {
    return { kind: "discard", target: slot(m[1]), amount: amount(m[2]) };
  }
  if ((m = re(`each opponent discards ${N} cards?`).exec(s))) {
    return { kind: "discard", target: "each-opponent", amount: amount(m[1]) };
  }
  if ((m = re(`mill ${N} cards?`).exec(s))) return { kind: "mill", target: "you", amount: amount(m[1]) };
  if ((m = re(`(target player|target opponent) mills ${N} cards?`).exec(s))) {
    return { kind: "mill", target: slot(m[1]), amount: amount(m[2]) };
  }
  // "Look at target player's hand" (Glasses of Urza): a look alone.
  if ((m = re(`look at (target player|target opponent)'s hand`).exec(s))) {
    return { kind: "look-at-hand", target: slot(m[1]) };
  }
  if ((m = re(`each opponent mills ${N} cards?`).exec(s))) {
    return { kind: "mill", target: "each-opponent", amount: amount(m[1]) };
  }
  if ((m = re(`scry ${N}`).exec(s))) return { kind: "scry", amount: amount(m[1]) };
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

  // Life.
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
  // others sharing a color with it (`sharesColorWithTarget`).
  const KIN = `and each other (permanent|creature|artifact|enchantment|land) that shares a color with it`;
  const kin = (type, target) =>
    target === undefined ? undefined : { ...(type.toLowerCase() !== "permanent" ? { type: type.toLowerCase() } : {}), sharesColorWithTarget: target };
  if ((m = re(`~ deals ${N} damage to (${TARGET}) ${KIN}`).exec(s))) {
    const filter = kin(m[3], slot(m[2]));
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
  if (re("investigate").test(s)) return { kind: "create-token", token: "Clue Token", count: 1 };
  // Learn (rule 701.48a): the rummage alone — no deck here has a sideboard,
  // so there's no Lesson outside the game to fetch (`learn()` in helpers.ts).
  if (re("learn").test(s)) {
    return {
      kind: "may",
      prompt: "Learn: discard a card to draw a card?",
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
        ],
      },
    };
  }
  // Amass [type] N (rule 701.47): "Amass Orcs 2." — the type singular.
  if ((m = re(`amass ([A-Z][a-z]+) (\\d+)`).exec(s))) {
    const plural = m[1];
    const creatureType = /ves$/.test(plural) ? plural.replace(/ves$/, "f") : plural.replace(/s$/, "");
    return { kind: "amass", amount: Number(m[2]), creatureType };
  }

  // Counters.
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
  if ((m = re(`(destroy|exile) (${TARGET}) ${NAMESAKES}`).exec(s))) {
    const filter = namesakes(m[3], slot(m[2]));
    return filter === undefined ? null : { kind: m[1].toLowerCase() === "destroy" ? "destroy-all" : "exile-all", filter };
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
    const filter = kin(m[3], slot(m[2]));
    return filter === undefined ? null : { kind: `${m[1].toLowerCase()}-all`, filter };
  }
  if ((m = re(`(${TARGET}) ${KIN} gets? ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
    const filter = kin(m[2], slot(m[1]));
    return filter === undefined
      ? null
      : { kind: "modify-pt-all", filter, power: Number(m[3]), toughness: Number(m[4]), duration: "end-of-turn" };
  }
  if ((m = re(`destroy (${TARGET})`).exec(s))) return { kind: "destroy", target: slot(m[1]) };
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
  if (re("return ~ to its owner's hand").test(s)) return { kind: "return-to-hand", target: "source" };
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
  if ((m = re(`counter (${TARGET})`).exec(s))) {
    const t = targetOf(m[1]);
    if (typeof t !== "string" || !/(spell|triggered-ability)$/.test(t)) return null;
    return { kind: "counter", target: slot(m[1]) };
  }
  if ((m = /^return (target .+? card from your graveyard) to your hand\.$/i.exec(s))) {
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "return-to-hand", target: i, from: "graveyard" };
  }
  if ((m = /^return (target .+? card from your graveyard) to the battlefield( tapped)?\.$/i.exec(s))) {
    // An Aura put onto the battlefield this way isn't attached to anything
    // (BACKLOG), so a card that names one (Rise to Glory) is left to author.
    if (/\bAura\b/.test(m[1])) return null;
    const i = slot(m[1]);
    return i === undefined ? null : { kind: "put-onto-battlefield", target: i, ...(m[2] ? { enterTapped: true } : {}) };
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
  if ((m = /^search your library for a card, put (?:it|that card) into your hand, then shuffle\.$/i.exec(s))) {
    // "A card", no quality: one must be found while there is one (701.23d).
    return { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 };
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
  if ((m = re(`(~|${TARGET}) gains ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
    const target = m[1] === "~" ? "source" : slot(m[1]);
    const kws = [m[2], m[3]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    const one = (keyword) => ({ kind: "grant-keyword", target, keyword, duration: "end-of-turn" });
    return kws.length === 1 ? one(kws[0]) : { kind: "sequence", effects: kws.map(one) };
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
  if ((m = re(`prevent the next ${N} damage that would be dealt to (${TARGET}) this turn`).exec(s))) {
    return { kind: "prevent-damage", target: slot(m[2]), amount: amount(m[1]) };
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
  if ((m = re(`the next time an? (?:(white|blue|black|red|green) )?source of your choice would deal damage to you this turn, prevent that damage`).exec(s))) {
    return {
      kind: "prevent-damage-from-chosen-source",
      ...(m[1] !== undefined ? { filter: { colors: [COLOR_WORDS[m[1].toLowerCase()]] } } : {}),
      to: "you",
      amount: "next-time",
    };
  }
  // Layer 5 (the Laces): "target spell or permanent becomes black", for good.
  // "Target spell or permanent" is read only here: a bounce of one (Venser)
  // needs a step per zone.
  if ((m = re(`target spell or permanent becomes (white|blue|black|red|green)(?: \(mana symbols on that permanent remain unchanged\.\))?`).exec(s))) {
    return { kind: "become-color", target: ctx.target({ kind: "spell-or-permanent" }), colors: [COLOR_WORDS[m[1].toLowerCase()]], duration: "permanent" };
  }

  // Combat this turn.
  if ((m = re(`(${TARGET}) can't block this turn`).exec(s))) return { kind: "restrict", target: slot(m[1]), restrictions: ["cant-block"] };
  if ((m = re(`(~|${TARGET}) can't be blocked this turn`).exec(s))) {
    return { kind: "grant-keyword", target: m[1] === "~" ? "source" : slot(m[1]), keyword: "unblockable", duration: "end-of-turn" };
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
  if ((m = re(`~ deals ${N} damage to each creature and each player`).exec(s))) {
    // One event (Pestilence): the creatures and the players are dealt it at once.
    const n = amount(m[1]);
    return {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage-all", filter: { type: "creature" }, amount: n },
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

  // Libraries and graveyards.
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

  // "It": the object the ability is about — its source, or the object its
  // trigger names — and only while nothing has been targeted, which "it"
  // could mean instead.
  const it = ctx.targets.length === 0 ? ctx.it : undefined;
  if (it !== undefined) {
    // A damage source is only the ability's own or the trigger's object
    // (`DamageFrom`): "enchanted creature deals …" has no shape.
    if ((it === "source" || it === "trigger-object") && (m = re(`it deals ${N} damage to (${TARGET})`).exec(s))) {
      return { kind: "damage", amount: amount(m[1]), target: slot(m[2]), ...(it === "source" ? {} : { from: it }) };
    }
    if ((m = re(`it gets ([+-]\\d+)/([+-]\\d+) until end of turn`).exec(s))) {
      return { kind: "modify-pt", target: it, power: Number(m[1]), toughness: Number(m[2]), duration: "end-of-turn" };
    }
    if ((m = re(`it gains ${KW}(?: and ${KW})? until end of turn`).exec(s))) {
      const kws = [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
      const one = (keyword) => ({ kind: "grant-keyword", target: it, keyword, duration: "end-of-turn" });
      return kws.length === 1 ? one(kws[0]) : { kind: "sequence", effects: kws.map(one) };
    }
    if ((m = re(`put ${N} ([+-]\\d+/[+-]\\d+|[a-z]+) counters? on it`).exec(s))) {
      return { kind: "add-counter", target: it, counter: m[2].toLowerCase(), amount: amount(m[1]) };
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
  }

  // Everything else that's a whole instruction by itself.
  if (re("you become the monarch").test(s)) return { kind: "become-monarch" };
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
export function parseEffect(text, outer) {
  // Each target a sentence names takes the next slot of the ability's list.
  const ctx = { ...outer, target: (spec) => outer.targets.push(spec) - 1 };
  const sentences = sentencesOf(text);
  const parsed = [];
  const todo = [];
  const hints = [];
  let skip = 0;
  for (const [i, sentence] of sentences.entries()) {
    if (skip > 0) {
      skip -= 1;
      continue;
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
    const ifDid = /^if you do, (.+)$/i.exec(sentence);
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
    if (/^it can't be regenerated\.$/i.test(sentence) && parsed.at(-1)?.kind === "destroy") {
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
    // "If that creature would die this turn, exile it instead." after the one
    // sentence that targeted (Lava Coil — rule 614.1a): that target.
    if (/^if that (?:creature|planeswalker|creature or planeswalker) would die this turn, exile it instead\.$/i.test(sentence) && i > 0 && ctx.targets.length === 1 && parsed.length > 0) {
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
    const lossM = /^its controller loses (\w+) life\.$/i.exec(sentence);
    if (lossM !== null && ctx.targets.length === 1 && parsed.length > 0 && typeof numberOf(lossM[1]) === "number") {
      const loss = { kind: "lose-life", amount: numberOf(lossM[1]), toControllerOfTarget: 0 };
      parsed.push(loss);
      hints.push({ sentence, effect: loss });
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
    // whatever that sentence was about.
    const sentenceCtx = i === 0 ? ctx : { ...ctx, it: undefined, departed: undefined };
    const inner = rhystic === null ? null : parseSentence(`${rhystic[1]}.`, sentenceCtx);
    const effect =
      rhystic === null
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
    if (effect === null || containsUndefined(effect)) {
      ctx.targets.length = before;
      todo.push(sentence);
    } else {
      parsed.push(effect);
      hints.push({ sentence, effect });
    }
  }
  if (todo.length > 0) return { effect: null, todo, hints };
  return { effect: parsed.length === 1 ? parsed[0] : { kind: "sequence", effects: parsed }, todo: [], hints: [] };
}

/** A one-unit effect done "for each" of `amount` instead — parley's create a
 * token, put a counter, +1/+1 to all, add a mana, gain a life — or null. */
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
export function parseFace(face, ctx = {}) {
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
    // An ability word or flavor word ("Landfall —", "Crushing Teeth —") means
    // nothing, so it's dropped. A few labels written the same way do mean
    // something: Exhaust and Boast restrict an activated ability and become
    // its flags, and the rest aren't read at all.
    // (A villainous choice's dash isn't a label either: what comes before it
    // is the trigger or instruction.)
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
    // Rule 103.6a, the Leylines ("…with him on the battlefield": Quicksilver).
    if (/^If (?:~|this card) is in your opening hand, you may begin the game with (?:it|him|her|them) on the battlefield\.$/.test(line)) {
      out.beginsOnBattlefield = true;
      continue;
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
    if ((m = /^Enchant (creature|land|artifact|enchantment|permanent|creature you control|creature or planeswalker)$/.exec(line))) {
      out.enchant = targetOf(`target ${m[1]}`);
      continue;
    }
    if ((m = /^Equip ((?:\{[^}]+\})+)$/.exec(line))) {
      out.activated.push({
        cost: { mana: m[1], tap: false },
        targets: ["creature-you-control"],
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
    // cost ("Splice onto Arcane—Exile four cards …") stays a person's.
    if (isSpell && (m = /^Splice onto (Arcane|instant or sorcery) ((?:\{[^}]+\})+)$/.exec(line))) {
      out.splice = { onto: m[1] === "Arcane" ? "arcane" : "instant-or-sorcery", cost: m[2] };
      continue;
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
    if ((m = /^Squad ((?:\{[^}]+\})+)$/.exec(line))) {
      out.kicker = { cost: m[1], multi: true, keyword: "squad" };
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
    // "Exile two creature cards from your graveyard" (the Skaabs): which,
    // chosen as the cost is paid (`additionalCost.exileFromGraveyard`).
    if (castable && (m = /^As an additional cost to cast ~, exile (a|an|one|two|three|four|five|six|seven|eight) (creature )?cards? from your graveyard\.$/.exec(line))) {
      const count = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 }[m[1]];
      out.additionalCost = { exileFromGraveyard: { count, ...(m[2] ? { filter: { type: "creature" } } : {}) } };
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
    const st = parseStatic(line, printed(raw));
    if (st !== null) { out.static.push(st); continue; }

    // Loyalty abilities.
    if ((m = /^([+−-]?)(\d+|X): (.+)$/.exec(line)) && face.loyalty !== undefined) {
      const n = m[2] === "X" ? null : Number(m[2]) * (m[1] === "" || m[1] === "+" ? 1 : -1);
      // The engine has no X loyalty cost; 0 keeps the skeleton compiling, and
      // the TODO keeps it out of review/.
      const ability = { loyaltyCost: n ?? 0, cost: { mana: null, tap: false }, targets: [], effect: null, resolve: null, text: printed(raw) };
      if (n === null) { ability.__todo = ["an X loyalty cost"]; }
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
      const restrictions = [];
      rest = rest.replace(/ Activate only (as a sorcery|once each turn|during your turn)\.$/, (_x, r) => {
        restrictions.push(r);
        return "";
      });
      rest = rest.replace(/ Activate only (as a sorcery|once each turn|during your turn)\.$/, (_x, r) => {
        restrictions.push(r);
        return "";
      });
      if (restrictions.includes("as a sorcery")) ability.sorcerySpeed = true;
      if (restrictions.includes("once each turn")) ability.oncePerTurn = true;
      if (restrictions.includes("during your turn")) ability.condition = { kind: "your-turn" };
      // "Any player may activate this ability [but only as a sorcery]" (rule
      // 602.2 — Prophecy's Glittering Lion, Excavation).
      rest = rest.replace(/ Any player may activate this ability( but only as a sorcery)?\.$/, (_x, sorcery) => {
        ability.anyPlayer = true;
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
      if (/Activate only /.test(rest)) {
        ability.__todo = [`a restriction: "${rest.slice(rest.indexOf("Activate only "))}"`];
        rest = rest.slice(0, rest.indexOf(" Activate only "));
      }
      i = fillEffect(ability, rest, { tokenFor }, lines, i);
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
      const parsedTriggers = parseTrigger(clause);
      if (parsedTriggers === null || (whileSaddled && !parsedTriggers.every((t) => t.on === "attacks" && t.who === "self"))) {
        out.todo.push(printed(raw));
        continue;
      }
      let rest = comma > 0 ? line.slice(comma + 2) : "";
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
        ...(whileSaddled ? { whileCondition: { kind: "source", filter: { saddled: true } } } : {}),
      };
      let triggers = parsedTriggers;
      if (/^if /i.test(rest)) {
        // An intervening-if (rule 603.4) is the ability's `condition`: read
        // for the few the engine names, else left to a person.
        const clause = rest.slice(0, rest.indexOf(",") + 1);
        const condition = INTERVENING_IFS[clause.toLowerCase()] ?? devotionIf(clause) ?? kickedWithIf(clause, out.kicker);
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
      const first = { trigger: triggers[0], ...base };
      const next = fillEffect(
        first,
        rest,
        { tokenFor, onStack: true, it: itOf(triggers), departed: departedOf(triggers) },
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
      const ctx2 = { targets: spellTargets, tokenFor, onStack: true, spell: true };
      let text = out.spellLines.map((l) => l.line).join(" ");
      // "If a Dragon was beheld, …" / "If this spell's additional cost was
      // paid, …" closing a "you may behold" spell (rules 701.4b, 607.2i):
      // the kicked cast does that too — its effect the spell's and then
      // this, with any target it adds after the spell's own. Not an
      // "instead", which rewrites the spell's text: that's a person's.
      let kickedTail;
      if (out.kicker?.keyword === "behold" || out.kicker?.keyword === "waterbend" || out.kicker?.keyword === "bargain") {
        const sentences = sentencesOf(text);
        const last = sentences.at(-1) ?? "";
        const tail =
          /^If (?:a|an) .+ was beheld, (.+)$/.exec(last) ??
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
      out.effect = r.effect;
      if (r.effect === null) {
        out.todo.push(...r.todo);
        out.effectHints = r.hints;
      }
      // Awaken (rule 702.113a): the awaken cast's targets and effect are the
      // spell's own and then the land's.
      if (out.awakenKeyword !== undefined && r.effect !== null) {
        out.overload = awaken(out.awakenKeyword.n, out.awakenKeyword.cost, { targets: ownTargets, effect: r.effect });
      }
      if (kickedTail !== undefined) {
        const extra = r.effect === null ? { effect: null } : parseEffect(kickedTail.rest, ctx2);
        if (extra.effect === null) out.todo.push(kickedTail.sentence);
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
    (face.name !== undefined && oracleText.includes(`exiled with ${face.name}`))
  ) {
    const linkExiles = (node) => {
      if (Array.isArray(node)) node.forEach(linkExiles);
      else if (node !== null && typeof node === "object") {
        if (node.kind === "exile" && node.untilSourceLeaves !== true) node.linked = true;
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

/** Stands for "this ability" in a copy exception until `parseFace` knows
 * which ability the sentence is in. */
const THIS_ABILITY = "this ability";

/** "As long as you have max speed" (rules 702.178a, 702.179e) — the
 * `maxSpeed()` helper's condition. */
const MAX_SPEED = { kind: "speed", atLeast: 4 };

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

/** A static's trailing "as long as …" by its words, and the `condition` it
 * becomes (`parseStatic`). */
const STATIC_CONDITION_SUFFIXES = [
  [" as long as two or more nonland permanents entered the battlefield under your control this turn.", CELEBRATION_CONDITION],
  // Ascend (rule 702.131 — Rivals of Ixalan): "~ gets +2/+2 as long as you
  // have the city's blessing" (Dusk Charger).
  [" as long as you have the city's blessing.", { kind: "citys-blessing" }],
];
/** The same, leading: "As long as you have the city's blessing, ~ has
 * hexproof" (Slippery Scoundrel). */
const STATIC_CONDITION_PREFIXES = [
  ["As long as you have the city's blessing, ", { kind: "citys-blessing" }],
  // Renowned (rule 702.112b): "As long as ~ is renowned, it has menace"
  // (Goblin Glory Chaser) — the "it" is ~.
  ["As long as ~ is renowned, ", { kind: "source", filter: { renowned: true } }],
];

/** Intervening-ifs (rule 603.4) by their words, as the pool writes them:
 * raid (Alesha), morbid (Liliana's Devotee), void (Elegy Acolyte), revolt
 * (Hidden Stockpile) and celebration (Pests of Honor). */
const INTERVENING_IFS = {
  // Coven (Midnight Hunt) and day/night (rule 731.1).
  "if you control three or more creatures with different powers,": { kind: "coven" },
  "if it's night,": { kind: "day-night", is: "night" },
  "if it's day,": { kind: "day-night", is: "day" },
  "if you attacked this turn,": { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
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

function devotionIf(clause) {
  const m = new RegExp(`^if your devotion to ${DEVOTION} is ${N} or (greater|less),$`).exec(clause);
  if (m === null) return undefined;
  const n = numberOf(m[3]);
  if (typeof n !== "number") return undefined;
  return { kind: "devotion", colors: devotionColors(m[1], m[2]), ...(m[4] === "greater" ? { atLeast: n } : { atMost: n }) };
}

/**
 * What "it" means in a triggered ability's effect: the source itself, when the
 * trigger is about the source ("When ~ dies, it deals 2 damage to any
 * target"), or the object the trigger names ("Whenever a creature you control
 * attacks, it gets +1/+0"). Nothing for a trigger about a step or a player.
 */
function itOf(triggers) {
  const objectEvents = ["enters-battlefield", "dies", "attacks", "blocks", "becomes-blocked", "deals-combat-damage-to-player"];
  if (triggers.every((t) => t.who === "self" && objectEvents.includes(t.on))) return "source";
  // The permanent a spell or ability targeted ("that creature" — Monk Gyatso).
  const othersEvents = [...objectEvents, "becomes-target"];
  if (triggers.every((t) => t.who !== "self" && t.filter !== undefined && othersEvents.includes(t.on))) return "trigger-object";
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
  const modalHead = /^Choose (one|two|one or both|one or more) —$/.exec(text.trim());
  if (modalHead) {
    let j = i + 1;
    const bullets = [];
    while (j < lines.length && lines[j].startsWith("•")) bullets.push(lines[j].replace(/^•\s*/, "")), (j += 1);
    const modes = [];
    let ok = bullets.length > 0;
    for (const b of bullets) {
      const r = parseEffect(b, { targets: [], tokenFor: ctx.tokenFor, onStack: ctx.onStack });
      // A resolution-time mode can't choose targets of its own.
      if (r.effect === null || containsTarget(r.effect)) ok = false;
      else modes.push({ text: b, effect: r.effect });
    }
    const [min, max] = modeCounts(modalHead[1], bullets.length);
    // A modal triggered ability announces its modes as it goes on the stack
    // (rules 603.3c, 700.2b). A modal activated ability would choose them as
    // it resolves instead (AUTHORING §15), so it isn't read.
    if (ok && ability.trigger === undefined) {
      ability.__todo = [...(ability.__todo ?? []), `modes chosen as it resolves, not as it is activated: ${bullets.join(" / ")}`];
    } else if (ok) ability.effect = { kind: "modal", announced: true, minModes: min, maxModes: max, modes };
    else ability.__todo = [...(ability.__todo ?? []), `the modes: ${bullets.join(" / ")}`];
    return j - 1;
  }
  const r = parseEffect(text, {
    targets: ability.targets,
    tokenFor: ctx.tokenFor,
    onStack: ctx.onStack,
    it: ctx.it,
    departed: ctx.departed,
  });
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
  const head = /^Choose (one|two|one or both|one or more) —$/.exec(spellLines[0].line);
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
  const [minModes, maxModes] = modeCounts(head[1], modes.length);
  return { castModal: { minModes, maxModes, modes }, effect: null, targets: [] };
}

/** Static lines the engine models in one shape. */
const COLOR_WORDS = { white: "W", blue: "U", black: "B", red: "R", green: "G" };
/** "your devotion to [white]( and [black])" — one colour or two (rule 700.5). */
const DEVOTION = "(white|blue|black|red|green)(?: and (white|blue|black|red|green))?";
const devotionColors = (a, b) => [a, b].filter(Boolean).map((w) => COLOR_WORDS[w]);

function parseStatic(line, text) {
  let m;
  // "… as long as [condition]." on a static the rest reads whole and that
  // has no condition of its own: celebration's "~ gets +1/+1 and has
  // trample as long as two or more nonland permanents entered the
  // battlefield under your control this turn" (Grand Ball Guest).
  for (const [suffix, condition] of STATIC_CONDITION_SUFFIXES) {
    if (!line.endsWith(suffix)) continue;
    const inner = parseStatic(`${line.slice(0, -suffix.length)}.`, text);
    if (inner !== null && inner.condition === undefined) return { ...inner, condition };
  }
  for (const [prefix, condition] of STATIC_CONDITION_PREFIXES) {
    if (!line.startsWith(prefix)) continue;
    const rest = line.slice(prefix.length).replace(/^it /, "~ ");
    const inner = parseStatic(rest.charAt(0).toUpperCase() + rest.slice(1), text);
    if (inner !== null && inner.condition === undefined) return { ...inner, condition };
  }
  // Rule 722.3a — `entersPrepared()`.
  if (line === "~ enters prepared.") {
    return { affects: { scope: "self" }, replacement: { event: "enters-battlefield", prepared: true }, text };
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
  if (line === "~ can't block.") return { affects: { scope: "self" }, restrictions: ["cant-block"], text };
  if (line === "~ can't attack or block.") return { affects: { scope: "self" }, restrictions: ["cant-attack", "cant-block"], text };
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
  if ((m = /^~ can't be blocked by creatures with power (\d+) or (less|greater)\.$/.exec(line))) {
    return { affects: { scope: "self" }, cantBeBlockedBy: { power: { op: m[2] === "less" ? "lte" : "gte", n: Number(m[1]) } }, text };
  }
  if (line === "You have no maximum hand size.") return { affects: { scope: "self" }, noMaxHandSize: true, text };
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
  if ((m = new RegExp(`^(Other )?creatures you control have ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return {
      affects: { scope: "creatures-you-control", ...(m[1] ? { excludeSelf: true } : {}) },
      grantKeywords: [m[2], m[3]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]),
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
  if ((m = new RegExp(`^(?:Equipped|Enchanted) creature gets ([+-]\\d+)/([+-]\\d+)(?: and has ${KW}(?: and ${KW})?)?\\.$`, "i").exec(line))) {
    const kws = [m[3], m[4]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]);
    return { affects: { scope: "attached" }, grantPt: [Number(m[1]), Number(m[2])], ...(kws.length ? { grantKeywords: kws } : {}), text };
  }
  if ((m = new RegExp(`^(?:Equipped|Enchanted) creature has ${KW}(?: and ${KW})?\\.$`, "i").exec(line))) {
    return { affects: { scope: "attached" }, grantKeywords: [m[1], m[2]].filter(Boolean).map((k) => KEYWORDS[k.toLowerCase()]), text };
  }
  if ((m = /^(?:Enchanted|Equipped) creature can't attack or block\.$/.exec(line))) {
    return { affects: { scope: "attached" }, restrictions: ["cant-attack", "cant-block"], text };
  }
  // "Enchanted creature doesn't untap during its controller's untap step"
  // (rule 502.3 — Tractor Beam, Watery Grasp).
  if (/^(?:Enchanted|Equipped) (?:creature|permanent|land|artifact) doesn't untap during its controller's untap step\.$/.test(line)) {
    return { affects: { scope: "attached" }, restrictions: ["doesnt-untap"], text };
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
