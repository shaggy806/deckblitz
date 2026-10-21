import { defineCard } from "../define.js";

// EDHREC rank 28430.

const TEXT = "This creature gets +3/+3 as long as there is a land card in your graveyard.";

export default defineCard({
  name: "Murasa Behemoth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "land" } },
      grantPt: [3, 3],
      text: TEXT,
    },
  ],
});
