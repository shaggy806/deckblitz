import { defineCard } from "../define.js";

export default defineCard({
  name: "Rune-Tail's Essence",
  art: "https://cards.scryfall.io/art_crop/front/4/2/42ba0e13-d20f-47f9-9c86-2b0b13c39ada.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: "Prevent all damage that would be dealt to creatures you control.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, toFilter: { type: "creature", controlledBy: "you" } },
      text: "Prevent all damage that would be dealt to creatures you control.",
    },
  ],
  faces: ["Rune-Tail, Kitsune Ascendant", "Rune-Tail's Essence"],
  flip: true,
});
