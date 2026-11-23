import { defineCard } from "../define.js";

// A playtest card (Unknown Event): an Equipment Vehicle. Crewed, it's an
// Equipment that's a creature, so it can't equip and comes unattached
// (rule 301.5c, the ruling).

export default defineCard({
  name: "Unicycle",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment", "Vehicle"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike", "haste"],
  text: "First strike, haste\nEquipped creature has first strike and haste.\nEquip {1}\nCrew 1",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike", "haste"],
      text: "Equipped creature has first strike and haste.",
    },
  ],
});
