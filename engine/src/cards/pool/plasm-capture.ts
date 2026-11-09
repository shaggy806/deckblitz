import { defineCard } from "../define.js";

const DELAYED_TEXT =
  "At the beginning of your next first main phase, add X mana in any combination of colors, where X is that spell's mana value.";

export default defineCard({
  name: "Plasm Capture",
  manaCost: "{G}{G}{U}{U}",
  colors: ["G", "U"],
  types: ["instant"],
  text: `Counter target spell. ${DELAYED_TEXT}`,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "delayed-trigger",
        at: { step: "precombat-main", whose: "you" },
        effect: {
          kind: "add-mana",
          mana: { oneOf: ["W", "U", "B", "R", "G"] },
          amount: { manaValueOf: 0 },
        },
        text: DELAYED_TEXT,
      },
    ],
  },
});
