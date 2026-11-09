import { defineCard } from "../define.js";

// EDHREC rank 2374. Each creature counts the Equipment on itself
// (`relativeToAffected`: the count's "source" is the creature being read).
export default defineCard({
  name: "Bruenor Battlehammer",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 5,
  toughness: 3,
  text: "Each creature you control gets +2/+0 for each Equipment attached to it.\nYou may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, relativeToAffected: true, pt: [2, 0] },
      text: "Each creature you control gets +2/+0 for each Equipment attached to it.",
    },
    {
      affects: { scope: "self" },
      alternativeAbilityCost: { kind: "equip", mana: "{0}", firstEachTurn: true },
      text: "You may pay {0} rather than pay the equip cost of the first equip ability you activate each turn.",
    },
  ],
});
