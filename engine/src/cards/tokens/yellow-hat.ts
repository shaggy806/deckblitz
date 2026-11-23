import { defineCard } from "../define.js";

/**
 * The Keeper of the Yellow Hat's token — "a legendary artifact equipment token
 * named Yellow Hat with equip {2} and 'Equipped creature gets +4/+4 and gains
 * lifelink.'" A named legendary token (Cragflame's shape), so the legend rule
 * applies to a second one. Colorless. No token printing exists.
 */
const EQUIPPED_TEXT = "Equipped creature gets +4/+4 and gains lifelink.";

export default defineCard({
  name: "Yellow Hat",
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${EQUIPPED_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 4],
      grantKeywords: ["lifelink"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
