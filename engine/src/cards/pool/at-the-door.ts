import { defineCard } from "../define.js";

// An Unexpected Party's Adventure.
export default defineCard({
  name: "At the Door",
  art: "https://cards.scryfall.io/art_crop/back/3/a/3aa29fe8-1687-486f-b4df-c04977869ab1.jpg",
  manaCost: "{X}{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create X 2/2 red Dwarf creature tokens. (Then exile this card. You may cast the enchantment later from exile.)",
  faces: ["An Unexpected Party", "At the Door"],
  adventure: true,
  effect: { kind: "create-token", token: "2/2 Red Dwarf Token", count: "x" },
});
