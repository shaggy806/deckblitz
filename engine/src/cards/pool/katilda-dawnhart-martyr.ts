import { defineCard } from "../define.js";

const PT_TEXT =
  "Katilda's power and toughness are each equal to the number of permanents you control that are Spirits and/or enchantments.";

/** A characteristic-defining star/star: counted in every zone (rule 604.3), so
 * it counts itself — a Spirit — on the battlefield. */
export default defineCard({
  name: "Katilda, Dawnhart Martyr",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Warlock"],
  power: 0,
  toughness: 0,
  keywords: ["flying", "lifelink"],
  disturb: { cost: "{3}{W}{W}" },
  text: `Flying, lifelink, protection from Vampires\n${PT_TEXT}\nDisturb {3}{W}{W} (You may cast this card from your graveyard transformed for its disturb cost.)`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Vampire" } },
      text: "Protection from Vampires",
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { anyOf: [{ subtype: "Spirit" }, { type: "enchantment" }], controlledBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
      },
      text: PT_TEXT,
    },
  ],
  faces: ["Katilda, Dawnhart Martyr", "Katilda's Rising Dawn"],
  transform: true,
});
