import { defineCard } from "../define.js";

export default defineCard({
  name: "Forktail Sweep",
  art: "https://cards.scryfall.io/art_crop/back/3/d/3d74937b-c87f-4894-8f00-36e4d6844ebd.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Forktail Sweep deals 1 damage to each creature you don't control. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
  faces: ["Fang Dragon", "Forktail Sweep"],
  adventure: true,
});
