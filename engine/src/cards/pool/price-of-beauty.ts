import { defineCard } from "../define.js";


export default defineCard({
  name: "Price of Beauty",
  art: "https://cards.scryfall.io/art_crop/back/f/8/f8a0c0f6-fef9-42c5-934d-a2855c11b440.jpg",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create a Wicked Role token attached to target creature you control. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token", token: "Wicked Role Token", count: 1, attachedTo: 0 },
  faces: ["Conceited Witch", "Price of Beauty"],
  adventure: true,
});
