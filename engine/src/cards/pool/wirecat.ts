import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 32009. "An enchantment is on the
// battlefield" is anyone's: one you control or one an opponent does.

const TEXT = "This creature can't attack or block if an enchantment is on the battlefield.";

export default defineCard({
  name: "Wirecat",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { type: "enchantment" }, atLeast: 1, countsSelf: true },
          { kind: "opponent-controls", filter: { type: "enchantment" }, atLeast: 1 },
        ],
      },
      restrictions: ["cant-attack", "cant-block"],
      text: TEXT,
    },
  ],
});
