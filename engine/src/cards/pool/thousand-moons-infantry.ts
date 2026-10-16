import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Endbringer's untap: alongside the active
// player's permanents, not optional, and an effect stopping it untapping in
// your untap step doesn't reach other players' (the rulings).

export default defineCard({
  name: "Thousand Moons Infantry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  text: "Untap this creature during each other player's untap step.",
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: "self",
      text: "Untap this creature during each other player's untap step.",
    },
  ],
});
