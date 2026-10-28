import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, create a 3/1 red Knight creature token. Then if you're the monarch, this enchantment deals X damage to each opponent, where X is the number of creatures you control.";

export default defineCard({
  name: "Court of Embereth",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `When this enchantment enters, you become the monarch.\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When this enchantment enters, you become the monarch.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "3/1 Knight Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "monarch", who: "you" },
            then: {
              kind: "damage",
              who: "each-opponent",
              amount: { countOf: { type: "creature", controlledBy: "you" } },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
