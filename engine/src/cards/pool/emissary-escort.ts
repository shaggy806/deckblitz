import { defineCard } from "../define.js";

const PUMP_TEXT = "This creature gets +X/+0, where X is the greatest mana value among other artifacts you control.";

export default defineCard({
  name: "Emissary Escort",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 0,
  toughness: 4,
  text: PUMP_TEXT,
  static: [
    {
      // {X} counts 0 in a permanent's mana value (rule 202.3e).
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: {
          aggregate: "max",
          of: "mana-value",
          filter: { type: "artifact", controlledBy: "you" },
          excludeSelf: true,
        },
        pt: [1, 0],
      },
      text: PUMP_TEXT,
    },
  ],
});
