import { defineCard } from "../define.js";

export default defineCard({
  name: "Kyren Legate",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "If an opponent controls a Plains and you control a Mountain, you may cast this spell without paying its mana cost.\nHaste",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Plains" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Mountain" }, atLeast: 1 },
      ],
    },
  },
});
