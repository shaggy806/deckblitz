import { defineCard } from "../define.js";

/** The disturb back face of Drogskol Infantry, an Aura. Its "exile it
 * instead" is the face's own ability (`self`). */
const EXILE_TEXT = "If Drogskol Armaments would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Drogskol Armaments",
  art: "https://cards.scryfall.io/art_crop/back/f/8/f88e269e-ff3d-4775-8520-5b7a6dddf23d.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+2.\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Drogskol Infantry", "Drogskol Armaments"],
  transform: true,
  disturb: { cost: "{3}{W}" },
});
