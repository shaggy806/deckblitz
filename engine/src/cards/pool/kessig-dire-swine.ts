import { defineCard } from "../define.js";

const TEXT = "Delirium — This creature has trample as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Kessig Dire Swine",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar", "Horror"],
  power: 6,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
