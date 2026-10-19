import { defineCard } from "../define.js";

export default defineCard({
  name: "Sky Crier",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Citizen"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "lifelink"],
  text: "Flying, lifelink\n{3}{W}: You and target opponent each draw a card.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: "{3}{W}: You and target opponent each draw a card.",
    },
  ],
});
