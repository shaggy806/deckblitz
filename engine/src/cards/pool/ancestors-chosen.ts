import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you gain 1 life for each card in your graveyard.";

export default defineCard({
  name: "Ancestor's Chosen",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { graveyardSize: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
