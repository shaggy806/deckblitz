import { defineCard } from "../define.js";

// Ratcatcher Trainee's Adventure.

export default defineCard({
  name: "Pest Problem",
  art: "https://cards.scryfall.io/art_crop/back/7/f/7f4c0959-a107-4d61-9e51-256b2955f6ba.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: 'Create two 1/1 black Rat creature tokens with "This token can\'t block." (Then exile this card. You may cast the creature later from exile.)',
  effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 2 },
  faces: ["Ratcatcher Trainee", "Pest Problem"],
  adventure: true,
});
