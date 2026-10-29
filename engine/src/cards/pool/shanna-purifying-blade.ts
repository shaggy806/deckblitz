import { defineCard } from "../define.js";

// EDHREC rank 15532.
//
// Rulings:
//   [2022-09-09] You choose the value for X as the ability resolves.

const END_TEXT =
  "At the beginning of your end step, you may pay {X}. If you do, draw X cards. X can't be greater than the amount of life you gained this turn.";

export default defineCard({
  name: "Shanna, Purifying Blade",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to draw X cards? (X can't be greater than the life you gained this turn.)",
        cost: "{X}",
        maxX: { turnStat: "life-gained", who: "you" },
        effect: { kind: "draw", amount: "x" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
