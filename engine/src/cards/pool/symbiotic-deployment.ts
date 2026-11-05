import { defineCard } from "../define.js";

// EDHREC rank 22303.

export default defineCard({
  name: "Symbiotic Deployment",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Skip your draw step.\n{1}, Tap two untapped creatures you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: "{1}",
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Tap two untapped creatures you control: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
});
