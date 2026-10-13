import { defineCard } from "../define.js";

// EDHREC rank 11756.

export default defineCard({
  name: "Rakshasa's Bargain",
  manaCost: "{2/B}{2/G}{2/U}",
  colors: ["U", "B", "G"],
  types: ["instant"],
  text: "Look at the top four cards of your library. Put two of them into your hand and the rest into your graveyard.",
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 4,
    min: 2,
    max: 2,
    destination: "hand",
    leftover: "graveyard",
  },
});
