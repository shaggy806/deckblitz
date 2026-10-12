import { defineCard } from "../define.js";

// EDHREC rank 11755.
//
// Rulings:
//   [2025-11-17] The value of X is calculated only once, as Gloom Ripper's ability resolves.

const ENTER_TEXT =
  "When this creature enters, target creature you control gets +X/+0 until end of turn and up to one target creature an opponent controls gets -0/-X until end of turn, where X is the number of Elves you control plus the number of Elf cards in your graveyard.";

const X = {
  sum: [
    { countOf: { subtype: "Elf", controlledBy: "you" } },
    { countInGraveyard: { subtype: "Elf", ownedBy: "you" } },
  ],
} as const;

export default defineCard({
  name: "Gloom Ripper",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Assassin"],
  power: 4,
  toughness: 4,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
      // Both steps read X in one resolution with nothing moving between
      // them, so it is the same number for each (the ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: X, toughness: 0, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 0, toughness: { product: [X, -1] }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
