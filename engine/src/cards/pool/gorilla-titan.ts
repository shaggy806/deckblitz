import { defineCard } from "../define.js";

export default defineCard({
  name: "Gorilla Titan",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nThis creature gets +4/+4 as long as there are no cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 1 } },
      grantPt: [4, 4],
      text: "This creature gets +4/+4 as long as there are no cards in your graveyard.",
    },
  ],
});
