import { defineCard } from "../define.js";

// Questing Druid's Adventure.
//
// Rulings:
//   [2023-09-01] You pay all costs and follow all normal timing rules for cards played from exile
//     with Seek the Beast.

export default defineCard({
  name: "Seek the Beast",
  art: "https://cards.scryfall.io/art_crop/back/7/2/72c130e2-1e17-4996-a5ae-231155d68261.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Exile the top two cards of your library. Until your next end step, you may play those cards.",
  faces: ["Questing Druid", "Seek the Beast"],
  adventure: true,
  targets: [],
  effect: { kind: "impulse-exile", amount: 2, duration: "your-next-end-step" },
});
