import { defineCard } from "../define.js";

// EDHREC rank 16910.
//
// Rulings:
//   [2025-11-21] The amount of damage Jet's first ability deals is calculated only on resolution
//     of the ability. Only creatures you control when the ability resolves will be counted.
//
// "Each of up to two target creatures" is two optional slots, the second
// another creature (Arcade Cabinet's shape).
const ENTER_TEXT =
  "When Jet enters, he deals damage equal to the number of creatures you control to target creature an opponent controls.";
const DIES_TEXT = "When Jet dies, put a +1/+1 counter on each of up to two target creatures.";

export default defineCard({
  name: "Jet, Freedom Fighter",
  manaCost: "{2}{R/W}{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Ally"],
  power: 3,
  toughness: 1,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
