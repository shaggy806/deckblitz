import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, the next instant or sorcery spell you cast this turn costs {X} less to cast, where X is this creature's power as this ability resolves.";

export default defineCard({
  name: "Maelstrom Muse",
  manaCost: "{1}{U}{U/R}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Djinn", "Wizard"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { powerOf: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
