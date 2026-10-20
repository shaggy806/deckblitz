import { defineCard } from "../define.js";

// The back face of Umara Wizard (a modal double-faced card — rule 712).

export default defineCard({
  name: "Umara Skyfalls",
  art: "https://cards.scryfall.io/art_crop/back/8/9/890eee8d-a339-4143-adfa-1b17ec10c099.jpg",
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
  faces: ["Umara Wizard", "Umara Skyfalls"],
});
