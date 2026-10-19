import { defineCard } from "../define.js";

export default defineCard({
  name: "Majestic Metamorphosis",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Until end of turn, target artifact or creature becomes a 4/4 Angel artifact creature and gains flying.\n" +
    "Draw a card.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      // "Becomes a [creature type] artifact creature" keeps its other card
      // types and subtypes but replaces its creature types (rule 205.1b); it
      // keeps its abilities and colors (the ruling).
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Angel"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
