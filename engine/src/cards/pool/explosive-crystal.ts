import { defineCard } from "../define.js";

// Amethyst Dragon's Adventure (`amethyst-dragon.ts`). The number of targets
// and the division are chosen as it's cast, at least 1 damage to each (rule
// 601.2d); a target gone illegal by resolution loses its share, which isn't
// dealt to another (its rulings).

export default defineCard({
  name: "Explosive Crystal",
  art: "https://cards.scryfall.io/art_crop/back/5/7/57adbd6e-88ec-4472-a9c9-90b679fa881f.jpg",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Explosive Crystal deals 4 damage divided as you choose among any number of targets. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "any-number", of: "any-target", max: 4 }],
  divided: { total: 4, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
  faces: ["Amethyst Dragon", "Explosive Crystal"],
  adventure: true,
});
