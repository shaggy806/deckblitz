import { defineCard } from "../define.js";

// EDHREC rank 25485.

export default defineCard({
  name: "Emperor's Vanguard",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 4,
  toughness: 3,
  text: "Whenever this creature deals combat damage to a player, it explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, it explores.",
    },
  ],
});
