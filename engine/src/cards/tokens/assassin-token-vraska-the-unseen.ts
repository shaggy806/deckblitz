import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals combat damage to a player, that player loses the game.";

// Vraska the Unseen's 1/1 black Assassin.
export default defineCard({
  name: "Assassin Token (Vraska the Unseen)",
  art: "4401437c-23ea-44ac-a8e7-eb033e1d61eb",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Assassin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "lose-game", who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
