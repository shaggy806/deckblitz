import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 28079.
//
// Checked only as attackers are declared (the ruling).

export default defineCard({
  name: "Deep-Sea Terror",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 6,
  toughness: 6,
  text: "This creature can't attack unless there are seven or more cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 7 } },
      restrictions: ["cant-attack"],
      text: "This creature can't attack unless there are seven or more cards in your graveyard.",
    },
  ],
});
