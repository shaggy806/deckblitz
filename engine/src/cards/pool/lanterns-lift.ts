import { defineCard } from "../define.js";

/** The disturb back face of Lantern Bearer, an Aura. Its "exile it instead"
 * is the face's own ability (`self`). */
const EXILE_TEXT = "If Lanterns' Lift would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Lanterns' Lift",
  art: "https://cards.scryfall.io/art_crop/back/0/e/0e568af8-9ddf-4efd-92ec-74a54b811c03.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +1/+1 and has flying.\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 and has flying.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Lantern Bearer", "Lanterns' Lift"],
  transform: true,
  disturb: { cost: "{2}{U}" },
});
