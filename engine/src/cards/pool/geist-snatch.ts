import { defineCard } from "../define.js";

// EDHREC rank 24187.
//
// Rulings: an illegal target means no token (the whole spell doesn't
// resolve); a creature spell that can't be countered still leaves you the token.

export default defineCard({
  name: "Geist Snatch",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. Create a 1/1 blue Spirit creature token with flying.",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Spirit Token (Saint Traft and Rem Karolus)", count: 1 },
    ],
  },
});
