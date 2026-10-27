import { defineCard } from "../define.js";

export default defineCard({
  name: "Rage of Winter",
  art: "https://cards.scryfall.io/art_crop/back/d/e/de2f964a-e4e1-4321-92ad-34b781868e11.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  faces: ["Queen of Ice", "Rage of Winter"],
  adventure: true,
  effect: { kind: "tap", target: 0, doesntUntapNext: true },
});
