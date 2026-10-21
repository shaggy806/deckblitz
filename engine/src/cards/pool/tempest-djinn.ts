import { defineCard } from "../define.js";

export default defineCard({
  name: "Tempest Djinn",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature gets +1/+0 for each basic Island you control.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        filter: { type: "land", subtype: "Island", supertype: "basic", controlledBy: "you" },
        pt: [1, 0],
      },
      text: "This creature gets +1/+0 for each basic Island you control.",
    },
  ],
});
