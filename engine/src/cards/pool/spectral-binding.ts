import { defineCard } from "../define.js";

/** The disturb back face of Binding Geist, an Aura cast from the graveyard
 * targeting what it will enchant. Its "exile it instead" is the face's own
 * ability (`self`), as on Hook-Haunt Drifter. */
const EXILE_TEXT = "If Spectral Binding would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Spectral Binding",
  art: "https://cards.scryfall.io/art_crop/back/7/3/730e4629-dc54-415d-9493-88885788ca19.jpg",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets -2/-0.\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-2, 0],
      text: "Enchanted creature gets -2/-0.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Binding Geist", "Spectral Binding"],
  transform: true,
  disturb: { cost: "{1}{U}" },
});
