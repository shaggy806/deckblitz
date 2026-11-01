import { defineCard } from "../define.js";

// EDHREC rank 7452.
export default defineCard({
  name: "Deeproot Historian",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Druid"],
  power: 3,
  toughness: 3,
  text: "Merfolk and Druid cards in your graveyard have retrace. (You may cast cards with retrace from your graveyard by discarding a land card in addition to paying their other costs.)",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { subtypes: ["Merfolk", "Druid"] }, keywords: [{ keyword: "retrace" }] },
      text: "Merfolk and Druid cards in your graveyard have retrace.",
    },
  ],
});
