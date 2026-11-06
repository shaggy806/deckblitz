import { defineCard } from "../define.js";

// EDHREC rank 30361.

const COST_TEXT = "Klingon spells and Warrior spells you cast cost {1} less to cast.";
const ENTER_TEXT =
  "Whenever another Klingon or Warrior you control enters, this creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Gagh Slinger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${COST_TEXT}\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtypes: ["Klingon", "Warrior"] }, caster: "you", reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtypes: ["Klingon", "Warrior"] },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
