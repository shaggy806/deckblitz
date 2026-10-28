import { defineCard } from "../define.js";

// EDHREC rank 14730.

export default defineCard({
  name: "Nevermore",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] } },
  text: "As this enchantment enters, choose a nonland card name.\nSpells with the chosen name can't be cast.",
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", spells: { chosenName: true } },
      text: "Spells with the chosen name can't be cast.",
    },
  ],
});
