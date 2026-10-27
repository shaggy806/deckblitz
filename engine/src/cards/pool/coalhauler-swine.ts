import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 15546. Truefire Captain's
// trigger, to each player (its controller included).
const TEXT = "Whenever this creature is dealt damage, it deals that much damage to each player.";

export default defineCard({
  name: "Coalhauler Swine",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
