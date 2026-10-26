import { defineCard } from "../define.js";

// EDHREC rank 8737. Tergrid's Lantern's punisher choice, made by the enchanted
// player (the active player in their upkeep); they may always take the 3 life
// loss, even with a card to discard or a permanent to sacrifice (the ruling).

const TEXT =
  "At the beginning of enchanted player's upkeep, that player loses 3 life unless they sacrifice a nonland permanent of their choice or discard a card.";

export default defineCard({
  name: "Torment of Scarabs",
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
        kind: "unless",
        chooser: "active-player",
        options: [
          { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
          { discard: 1, text: "Discard a card" },
        ],
        otherwise: { kind: "lose-life", amount: 3, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
