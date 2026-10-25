import { defineCard } from "../define.js";

// EDHREC rank 22204. Opponents' life is checked only as the ability resolves
// (the ruling): a `conditional`, not an intervening if.

const TEXT = "At the beginning of your upkeep, you lose 1 life unless an opponent has 10 or less life.";

export default defineCard({
  name: "Vampire Lacerator",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "life-total", who: "opponent", atMost: 10 } },
        then: { kind: "lose-life", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
