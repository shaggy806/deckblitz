import { defineCard } from "../define.js";

const TEXT =
  "If a red instant or sorcery spell you control or a red planeswalker you control would deal damage to a permanent or player, it deals that much damage plus 2 to that permanent or player instead.";

export default defineCard({
  name: "Pyromancer's Gauntlet",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 2,
        source: { colors: ["R"], typesAnyOf: ["instant", "sorcery", "planeswalker"], controlledBy: "you" },
      },
      text: TEXT,
    },
  ],
});
