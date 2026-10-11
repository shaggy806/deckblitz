import { defineCard } from "../define.js";

// Great Ugly-Looking Goblin's Adventure.
// Makes Goblin Army by amassing → the engine's "Army Token" (amass adds Goblin).
export default defineCard({
  name: "Clap! Snap!",
  art: "https://cards.scryfall.io/art_crop/back/c/8/c87f6004-e1cf-42b2-9647-322bc4939339.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Amass Goblins 2. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "amass", amount: 2, creatureType: "Goblin" },
  faces: ["Great Ugly-Looking Goblin", "Clap! Snap!"],
  adventure: true,
});
