import { defineCard } from "../define.js";

// EDHREC rank 25158.

export default defineCard({
  name: "Crosstown Courier",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken"],
  power: 2,
  toughness: 1,
  text: "Whenever this creature deals combat damage to a player, that player mills that many cards.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "trigger-player", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player mills that many cards.",
    },
  ],
});
