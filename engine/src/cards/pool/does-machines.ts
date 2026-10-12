import { defineCard } from "../define.js";
import { atLevel, classLevel, CLASS_REMINDER, distinctTargets } from "../helpers.js";

// EDHREC rank 14697.
//
// A Class (rule 716): each level bar is a sorcery-speed activated ability
// from the level below (`classLevel`), and the abilities under it are gated
// on the level (`atLevel`). Level 3 is Tezzeret, Cruel Captain's emblem: the
// counters first, then — as it resolves — an artifact that isn't a creature
// becomes a 0/0 Robot creature for good (the card gives no duration), keeping
// every type, subtype and ability it had (the rulings): a Vehicle's base P/T
// becomes 0/0, which crewing won't restore, and an Equipment falls off what
// it equips (rule 301.5c).
const ENTERS = "When this Class enters, mill two cards, draw two cards, then discard two cards.";
const LEVEL_2 = "When this Class becomes level 2, return up to two target artifact cards from your graveyard to your hand.";
const LEVEL_3 =
  "At the beginning of combat on your turn, put three +1/+1 counters on target artifact you control. If it isn't a creature, it becomes a 0/0 Robot creature in addition to its other types.";

export default defineCard({
  name: "Does Machines",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ENTERS}\n{1}{U}: Level 2\n${LEVEL_2}\n{4}{U}: Level 3\n${LEVEL_3}`,
  activated: [classLevel(2, "{1}{U}"), classLevel(3, "{4}{U}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    atLevel(2, {
      trigger: { on: "class-level-gained", who: "self", level: 2 },
      targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: LEVEL_2,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { notTypes: ["creature"] } },
            then: {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Robot"],
              duration: "permanent",
            },
          },
        ],
      },
      resolve: null,
      text: LEVEL_3,
    }),
  ],
});
