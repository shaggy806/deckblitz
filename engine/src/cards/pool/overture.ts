import { defineCard } from "../define.js";

// Jidoor, Aristocratic Capital's Adventure.
export default defineCard({
  name: "Overture",
  art: "https://cards.scryfall.io/art_crop/back/9/8/98b2d5b5-f85b-4c42-a0f5-a76f6af304ba.jpg",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target opponent mills half their library, rounded down. (Then exile this card. You may play the land later from exile.)",
  targets: ["opponent"],
  effect: { kind: "mill", target: 0, amount: { half: { librarySize: "each" }, round: "down" } },
});
