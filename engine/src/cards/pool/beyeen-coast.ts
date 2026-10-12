import { defineCard } from "../define.js";

export default defineCard({
  name: "Beyeen Coast",
  art: "https://cards.scryfall.io/art_crop/back/5/f/5f411f08-45dd-4d73-8894-daf51c175150.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Beyeen Veil", "Beyeen Coast"],
});
