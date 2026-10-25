import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodfire Enforcers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 5,
  toughness: 2,
  text: "This creature has first strike and trample as long as an instant card and a sorcery card are in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "instant" } },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "sorcery" } },
        ],
      },
      grantKeywords: ["first-strike", "trample"],
      text: "This creature has first strike and trample as long as an instant card and a sorcery card are in your graveyard.",
    },
  ],
});
