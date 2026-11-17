import { defineCard } from "../define.js";

// EDHREC rank 12121.
//
// Rulings:
//   [2021-06-18] If this creature gets enough -1/-1 counters put on it to cause it to go to the
//     graveyard, modular will put a number of +1/+1 counters on the target artifact creature
//     equal to the number of +1/+1 counters on this creature before it left the battlefield.
//   [2021-06-18] Zabaz the Glimmerwasp's replacement effect requires it to be on the battlefield
//     to work. Notably, that means it won't increase the counters given by its own modular
//     ability.
//
// Modular 1 (rule 702.43a) is Arcbound Ravager's shape, both halves stamped `keywordOf:
// "modular"`; the replacement is a `would-add-counter` "plus one" (Hardened Scales) narrowed to
// counters a modular triggered ability puts (`byKeywordAbility`), so neither a modular
// permanent's "enters with" counters nor any other effect's are touched.

const MODULAR_TEXT =
  "Modular 1 (This creature enters with a +1/+1 counter on it. When it dies, you may put its +1/+1 counters on target artifact creature.)";
const REPLACEMENT_TEXT =
  "If a modular triggered ability would put one or more +1/+1 counters on a creature you control, that many plus one +1/+1 counters are put on it instead.";

export default defineCard({
  name: "Zabaz, the Glimmerwasp",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 0,
  text: `${MODULAR_TEXT}\n${REPLACEMENT_TEXT}\n{R}: Destroy target artifact you control.\n{W}: Zabaz gains flying until end of turn.`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "may",
        prompt: "Put this creature's +1/+1 counters on target artifact creature?",
        effect: {
          kind: "add-counter",
          target: 0,
          counter: "+1/+1",
          amount: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      keywordOf: "modular",
      text: MODULAR_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      keywordOf: "modular",
      text: MODULAR_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        instead: { modify: { plus: 1 } },
        counterKind: "+1/+1",
        filter: { type: "creature" },
        byKeywordAbility: "modular",
      },
      text: REPLACEMENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "artifact", controlledBy: "you" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{R}: Destroy target artifact you control.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{W}: Zabaz gains flying until end of turn.",
    },
  ],
});
