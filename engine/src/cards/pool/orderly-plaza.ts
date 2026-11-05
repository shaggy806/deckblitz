import { defineCard } from "../define.js";

export default defineCard({
  name: "Orderly Plaza",
  art: "https://cards.scryfall.io/art_crop/back/0/c/0cccd328-457a-48ab-97fb-4bc319db2e60.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {W} or {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Suppression Ray", "Orderly Plaza"],
});
