import { defineCard } from "../define.js";

/** The disturb back face of Kindly Ancestor, an Aura cast from the graveyard
 * targeting what it will enchant. Its "exile it instead" is the face's own
 * ability (`self`), as on Hook-Haunt Drifter. */
const EXILE_TEXT = "If Ancestor's Embrace would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Ancestor's Embrace",
  art: "https://cards.scryfall.io/art_crop/back/2/5/25193485-7f41-4b05-9a69-4c112679f97c.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has lifelink.\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["lifelink"],
      text: "Enchanted creature has lifelink.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Kindly Ancestor", "Ancestor's Embrace"],
  transform: true,
  disturb: { cost: "{1}{W}" },
});
