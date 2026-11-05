import { defineCard } from "../define.js";

// EDHREC rank 16724.

export default defineCard({
  name: "Skyship Plunderer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature deals combat damage to a player, for each kind of counter on target permanent or player, give that permanent or player another counter of that kind.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["permanent-or-player"],
      effect: { kind: "another-counter-of-each-kind", target: 0 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, for each kind of counter on target permanent or player, give that permanent or player another counter of that kind.",
    },
  ],
});
