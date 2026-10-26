import { defineCard } from "../define.js";

// EDHREC rank 29157.

export default defineCard({
  name: "Screeching Silcaw",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nMetalcraft — Whenever this creature deals combat damage to a player, if you control three or more artifacts, that player mills four cards.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "metalcraft" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: 4 },
      resolve: null,
      text: "Metalcraft — Whenever this creature deals combat damage to a player, if you control three or more artifacts, that player mills four cards.",
    },
  ],
});
