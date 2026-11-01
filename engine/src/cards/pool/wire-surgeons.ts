import { defineCard } from "../define.js";

// EDHREC rank 21134.
export default defineCard({
  name: "Wire Surgeons",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 6,
  toughness: 5,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nEach artifact creature card in your graveyard has encore. Its encore cost is equal to its mana cost. (Exile it and pay its mana cost: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { types: ["artifact", "creature"] }, keywords: [{ keyword: "encore" }] },
      text: "Each artifact creature card in your graveyard has encore. Its encore cost is equal to its mana cost.",
    },
  ],
});
