import { defineCard } from "../define.js";

// Ruling: a spell that can't be countered is still a legal target — it isn't
// countered, but the fateful hour draw still happens.
export default defineCard({
  name: "Spell Snuff",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell.\nFateful hour — If you have 5 or less life, draw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "life-total", who: "you", atMost: 5 },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
