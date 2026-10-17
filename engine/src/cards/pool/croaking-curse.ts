import { defineCard } from "../define.js";


export default defineCard({
  name: "Croaking Curse",
  art: "https://cards.scryfall.io/art_crop/back/1/1/11507fa1-ef9e-41c9-b987-be57a03bd0df.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Tap target creature. Create a Cursed Role token attached to it. (Enchanted creature is 1/1.)",
  targets: ["creature"],
  faces: ["Vantress Transmuter", "Croaking Curse"],
  adventure: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "create-token", token: "Cursed Role Token", count: 1, attachedTo: 0 },
    ],
  },
});
