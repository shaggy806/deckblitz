import { defineCard } from "../define.js";

const TEXT = "Each artifact spell costs {1} more to cast for each artifact its controller controls.";

export default defineCard({
  name: "Hum of the Radix",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "artifact" },
        // "Its controller": the caster, whoever controls the Hum.
        increaseGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
        amountsReadByCaster: true,
      },
      text: TEXT,
    },
  ],
});
