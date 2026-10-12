import { defineCard } from "../define.js";

export default defineCard({
  name: "Runaway Boulder",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  cycling: { cost: "{2}" },
  text: "Flash\nWhen this artifact enters, it deals 6 damage to target creature an opponent controls.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 6, target: 0 },
      resolve: null,
      text: "When this artifact enters, it deals 6 damage to target creature an opponent controls.",
    },
  ],
});
