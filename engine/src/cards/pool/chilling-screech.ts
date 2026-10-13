import { defineCard } from "../define.js";

export default defineCard({
  name: "Chilling Screech",
  art: "https://cards.scryfall.io/art_crop/back/3/1/317744d1-ed78-4b53-a4d8-8c7ecfd9c4ae.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Omen"],
  text: "Counter target spell with mana value 2 or less. (Then shuffle this card into its owner's library.)",
  targets: [{ kind: "spell", filter: { manaValue: { op: "lte", n: 2 } } }],
  effect: { kind: "counter", target: 0 },
  faces: ["Runescale Stormbrood", "Chilling Screech"],
  omen: true,
});
