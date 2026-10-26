import { defineCard } from "../define.js";

// EDHREC rank 17185. The enchanted player — the active player in their own
// upkeep — chooses two cards of their graveyard and exiles them; with only one
// there, they exile that one (the ruling).

const TEXT = "At the beginning of enchanted player's upkeep, that player exiles two cards from their graveyard.";

export default defineCard({
  name: "Curse of Oblivion",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "active-player",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "graveyard",
          min: 2,
          max: 2,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
