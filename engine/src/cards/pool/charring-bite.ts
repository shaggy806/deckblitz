import { defineCard } from "../define.js";

export default defineCard({
  name: "Charring Bite",
  art: "https://cards.scryfall.io/art_crop/back/2/9/2999e3b1-6510-42b2-9429-28c07a64a44f.jpg",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Omen"],
  text: "Charring Bite deals 5 damage to target creature without flying. (Then shuffle this card into its owner's library.)",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  effect: { kind: "damage", amount: 5, target: 0 },
  faces: ["Twinmaw Stormbrood", "Charring Bite"],
  omen: true,
});
