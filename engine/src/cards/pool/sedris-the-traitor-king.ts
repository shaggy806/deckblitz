import { defineCard } from "../define.js";

// EDHREC rank 13125.
export default defineCard({
  name: "Sedris, the Traitor King",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Zombie", "Warrior"],
  power: 5,
  toughness: 5,
  text: "Each creature card in your graveyard has unearth {2}{B}. ({2}{B}: Return the card to the battlefield. The creature gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  static: [
    {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "creature" }, keywords: [{ keyword: "unearth", cost: "{2}{B}" }] },
      text: "Each creature card in your graveyard has unearth {2}{B}.",
    },
  ],
});
