import { defineCard } from "../define.js";

const TEXT =
  "If you would create one or more Treasure tokens, instead create those tokens plus an additional Treasure token.";

export default defineCard({
  name: "Xorn",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        plusOneToken: "Treasure Token",
        ofTokens: { subtypesAnyOf: ["Treasure"] },
      },
      text: TEXT,
    },
  ],
});
