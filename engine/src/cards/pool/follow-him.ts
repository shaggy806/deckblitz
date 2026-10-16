import { defineCard } from "../define.js";

// The Adventure of James, Wandering Dad. Investigating is creating a Clue
// token, X times.

export default defineCard({
  name: "Follow Him",
  art: "https://cards.scryfall.io/art_crop/back/3/1/31fed516-04e1-4453-b955-dfbd32bab2f3.jpg",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Investigate X times. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "create-token", token: "Clue Token", count: "x" },
  faces: ["James, Wandering Dad", "Follow Him"],
  adventure: true,
});
