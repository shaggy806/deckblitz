import { defineCard } from "../define.js";

// One instruction after another: what lost its abilities (indestructible among
// them) is destroyed. "Those creatures" are the ones that matched as the first
// sentence applied, and nothing between the two can change that.
const FILTER = { type: "creature", manaValue: { op: "lte", n: "x" } } as const;

export default defineCard({
  name: "Day of Black Sun",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each creature with mana value X or less loses all abilities until end of turn. Destroy those creatures.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become", filter: FILTER, loseAbilities: true, duration: "end-of-turn" },
      { kind: "destroy-all", filter: FILTER },
    ],
  },
});
