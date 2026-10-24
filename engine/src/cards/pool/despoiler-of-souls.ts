import { defineCard } from "../define.js";

// EDHREC rank 24165.

export default defineCard({
  name: "Despoiler of Souls",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 1,
  text: "This creature can't block.\n{B}{B}, Exile two other creature cards from your graveyard: Return this card from your graveyard to the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false, exileFromGraveyard: { count: 2, filter: { type: "creature" } } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: "{B}{B}, Exile two other creature cards from your graveyard: Return this card from your graveyard to the battlefield.",
    },
  ],
});
