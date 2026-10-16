import { defineCard } from "../define.js";

export default defineCard({
  name: "Curator of Sun's Creation",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: "Whenever you discover, discover again for the same value. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: { on: "discovers", who: "you" },
      targets: [],
      effect: { kind: "discover", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever you discover, discover again for the same value. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
