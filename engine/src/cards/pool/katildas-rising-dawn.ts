import { defineCard } from "../define.js";

/** Katilda's disturb back face. Its X counts the Aura itself (an
 * enchantment you control). */
const GRANT_TEXT =
  "Enchanted creature has flying, lifelink, and protection from Vampires, and it gets +X/+X, where X is the number of permanents you control that are Spirits and/or enchantments.";
const EXILE_TEXT = "If Katilda's Rising Dawn would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Katilda's Rising Dawn",
  art: "https://cards.scryfall.io/art_crop/back/0/e/0ef240aa-2a88-4ec4-888a-918466372adb.jpg",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["flying", "lifelink"], text: GRANT_TEXT },
    { affects: { scope: "attached" }, protection: { filter: { subtype: "Vampire" } }, text: GRANT_TEXT },
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { anyOf: [{ subtype: "Spirit" }, { type: "enchantment" }], controlledBy: "you" }, pt: [1, 1] },
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Katilda, Dawnhart Martyr", "Katilda's Rising Dawn"],
  transform: true,
  disturb: { cost: "{3}{W}{W}" },
});
