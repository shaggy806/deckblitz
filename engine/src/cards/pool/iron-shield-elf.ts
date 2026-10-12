import { defineCard } from "../define.js";

// EDHREC rank 12387.
//
// Rulings:
//   [2025-11-17] You can activate Iron-Shield Elf's ability even if Iron-Shield Elf is already
//     tapped.

const TEXT = "Discard a card: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Iron-Shield Elf",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 1,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy it. If its toughness is 0 or less, it still dies.)`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
