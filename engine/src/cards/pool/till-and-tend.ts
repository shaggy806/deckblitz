import { defineCard } from "../define.js";

// Beorn, Reluctant Host's Adventure.
//
// Rulings:
//   [2026-06-29] The effect that allows you to play an additional land that turn is cumulative
//     with other effects that do so.

export default defineCard({
  name: "Till and Tend",
  art: "https://cards.scryfall.io/art_crop/back/8/0/804589b7-3ef9-473d-97cc-c61a2d41f70d.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You may play an additional land this turn. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "additional-land-drop", amount: 1 },
  faces: ["Beorn, Reluctant Host", "Till and Tend"],
  adventure: true,
});
