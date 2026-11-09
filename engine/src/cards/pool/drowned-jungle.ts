import { defineCard } from "../define.js";

export default defineCard({
  name: "Drowned Jungle",
  art: "https://cards.scryfall.io/art_crop/back/7/a/7a1d3c1d-1373-4ac4-bb26-9780976efc4f.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {G} or {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Drowner of Truth", "Drowned Jungle"],
});
