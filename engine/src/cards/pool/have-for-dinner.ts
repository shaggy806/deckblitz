import { defineCard } from "../define.js";

// Devouring Sugarmaw's Adventure. One instruction, so the two tokens enter
// together.

export default defineCard({
  name: "Have for Dinner",
  art: "https://cards.scryfall.io/art_crop/back/5/8/58c7f52e-a97d-4475-ae00-3149991e723e.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Create a 1/1 white Human creature token and a Food token. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Devouring Sugarmaw", "Have for Dinner"],
  adventure: true,
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "create-token", token: "Human Token", count: 1 },
      { kind: "create-token", token: "Food Token", count: 1 },
    ],
  },
});
