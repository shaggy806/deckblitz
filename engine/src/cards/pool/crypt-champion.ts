import { defineCard } from "../define.js";

// Each player chooses in turn, and then the chosen cards enter at once (rule
// 101.4).
const ENTER_TEXT =
  "When this creature enters, each player puts a creature card with mana value 3 or less from their graveyard onto the battlefield.";
const SACRIFICE_TEXT = "When this creature enters, sacrifice it unless {R} was spent to cast it.";

export default defineCard({
  name: "Crypt Champion",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${ENTER_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        choicesHeld: true,
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "graveyard",
          min: 1,
          max: 1,
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpent: [{ type: "R", amount: { op: "gte", n: 1 } }] } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
