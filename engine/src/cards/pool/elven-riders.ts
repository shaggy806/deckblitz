import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 27133. "Except by Walls and/or creatures with
// flying": a blocker that is neither a Wall nor has flying can't block it.
// Reach isn't flying (the ruling), so a reach creature can't.

const TEXT = "This creature can't be blocked except by Walls and/or creatures with flying.";

export default defineCard({
  name: "Elven Riders",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-be-blocked", by: { notSubtypes: ["Wall"], notKeyword: "flying" } }],
      text: TEXT,
    },
  ],
});
