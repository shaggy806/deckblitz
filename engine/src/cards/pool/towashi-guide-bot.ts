import { defineCard } from "../define.js";

// EDHREC rank 7658.
//
// Rulings:
//   [2022-02-18] A creature that is equipped is considered modified no matter who controls the
//     Equipment that's attached to it.
//   [2022-02-18] An Aura controlled by an opponent does not cause a creature you control to be
//     modified.
//   [2022-02-18] A creature with a counter on it is considered modified no matter what kind of
//     counter it is or which player put it on that creature.
//
// `modified: true` is rule 700.9 exactly as the rulings read it.

const ENTER_TEXT = "When this creature enters, put a +1/+1 counter on target creature you control.";
const DRAW_TEXT =
  "{4}, {T}: Draw a card. This ability costs {1} less to activate for each modified creature you control.";

export default defineCard({
  name: "Towashi Guide-Bot",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${DRAW_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      costReduction: { reduceGeneric: { countOf: { type: "creature", controlledBy: "you", modified: true } } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
