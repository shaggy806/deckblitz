import { defineCard } from "../define.js";

// EDHREC rank 20010.

const ETB_TEXT = "When this enchantment enters, create a 2/1 black Villain creature token with menace.";
const DIES_TEXT =
  "Whenever a Villain you control dies, this enchantment deals 1 damage to each opponent and you gain 1 life.";

export default defineCard({
  name: "Criminal Enterprise",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${ETB_TEXT} (It can't be blocked except by two or more creatures.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Villain" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
