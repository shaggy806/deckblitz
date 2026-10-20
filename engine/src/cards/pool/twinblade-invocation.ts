import { defineCard } from "../define.js";

/** The disturb back face of Twinblade Geist, an Aura cast from the graveyard
 * targeting what it will enchant. Its "exile it instead" is the face's own
 * ability (`self`), as on Hook-Haunt Drifter. */
const EXILE_TEXT = "If Twinblade Invocation would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Twinblade Invocation",
  art: "https://cards.scryfall.io/art_crop/back/8/8/88bc8cdf-adfa-4a11-a8c0-484bc03edc65.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has double strike.\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["double-strike"],
      text: "Enchanted creature has double strike.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Twinblade Geist", "Twinblade Invocation"],
  transform: true,
  disturb: { cost: "{2}{W}" },
});
