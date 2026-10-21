import { defineCard } from "../define.js";

const TEXT = "This creature has flying as long as you've cast an instant or sorcery spell this turn.";

export default defineCard({
  name: "Leapfrog",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", filter: { typesAnyOf: ["instant", "sorcery"] } },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
