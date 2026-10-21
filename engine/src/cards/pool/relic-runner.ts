import { defineCard } from "../define.js";

export default defineCard({
  name: "Relic Runner",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: "This creature can't be blocked if you've cast a historic spell this turn. (Artifacts, legendaries, and Sagas are historic.)",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cast-this-turn",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      cantBeBlockedBy: {},
      text: "This creature can't be blocked if you've cast a historic spell this turn.",
    },
  ],
});
