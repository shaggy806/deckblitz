import { defineCard } from "../define.js";

// The land back face of Blackbloom Rogue (a modal double-faced card, rule 712).
export default defineCard({
  name: "Blackbloom Bog",
  art: "https://cards.scryfall.io/art_crop/back/3/2/32779721-b021-4bd4-95d1-4a19b78d9faa.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {B}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Blackbloom Rogue", "Blackbloom Bog"],
});
