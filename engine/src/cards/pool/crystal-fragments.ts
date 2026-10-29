import { defineCard } from "../define.js";

// EDHREC rank 7415. Transforms into Summon: Alexander.
//
// Rulings:
//   If you are instructed to put a card that isn't a double-faced card onto the battlefield
//   transformed, it will not enter at all. In that case, it stays in the zone it was previously
//   in.
//
// - The transform ability is Dion, Bahamut's Dominant's: a flicker of the
//   source back face up, a Saga that enters with its first lore counter.
const PUMP_TEXT = "Equipped creature gets +1/+1.";
const FLIP_TEXT =
  "{5}{W}{W}: Exile this Equipment, then return it to the battlefield transformed under its owner's control. " +
  "Activate only as a sorcery.";

export default defineCard({
  name: "Crystal Fragments",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${FLIP_TEXT}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT }],
  activated: [
    {
      cost: { mana: "{5}{W}{W}", tap: false },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "flicker", target: "source", transformed: true },
      resolve: null,
      text: FLIP_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  faces: ["Crystal Fragments", "Summon: Alexander"],
  transform: true,
});
