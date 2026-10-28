import { defineCard } from "../define.js";

export default defineCard({
  name: "Spikefield Cave",
  art: "https://cards.scryfall.io/art_crop/back/a/6/a69541db-3f4e-412f-aa8e-dec1e74f74dc.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {R}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Spikefield Hazard", "Spikefield Cave"],
});
