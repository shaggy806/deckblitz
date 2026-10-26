import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 29901.

const TEXT = "Hellbent — This creature has shadow as long as you have no cards in hand.";

export default defineCard({
  name: "Cutthroat il-Dal",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 1,
  text: `${TEXT} (It can block or be blocked by only creatures with shadow.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      grantKeywords: ["shadow"],
      text: TEXT,
    },
  ],
});
