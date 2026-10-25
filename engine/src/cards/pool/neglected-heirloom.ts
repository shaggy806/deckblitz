import { defineCard } from "../define.js";

// EDHREC rank 16521.
//
// Rulings:
//   When Neglected Heirloom transforms, it remains attached to the creature it's attached to. If
//     the equipped creature transforms into a noncreature permanent, Neglected Heirloom will
//     become unattached before it transforms into Ashmouth Blade.
//
// "When equipped creature transforms" is the `transforms` trigger on the
// host (`who: "attached"`), into either face.

const TRANSFORM_TEXT = "When equipped creature transforms, transform this Equipment.";

export default defineCard({
  name: "Neglected Heirloom",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${TRANSFORM_TEXT}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "transforms", who: "attached" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  faces: ["Neglected Heirloom", "Ashmouth Blade"],
  transform: true,
});
