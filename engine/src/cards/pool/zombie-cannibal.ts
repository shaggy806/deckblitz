import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 26209.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may exile target card from that player's graveyard.";

export default defineCard({
  name: "Zombie Cannibal",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "trigger-player" }],
      effect: {
        kind: "may",
        prompt: "Exile target card from that player's graveyard?",
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
