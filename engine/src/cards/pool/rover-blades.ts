import { defineCard } from "../define.js";

export default defineCard({
  name: "Rover Blades",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment", "Vehicle"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Double strike\nEquipped creature has double strike.\nEquip {4}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn. Creatures can't be attached to other permanents.)",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["double-strike"],
      text: "Equipped creature has double strike.",
    },
  ],
});
