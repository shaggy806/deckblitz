import { defineCard } from "../define.js";

// EDHREC rank 13944. Two equip abilities: the cheaper one only onto a
// creature token you control.
export default defineCard({
  name: "Team Pennant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1 and has vigilance and trample.\nEquip creature token {1}\nEquip {3}",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", token: true } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip creature token {1}",
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance", "trample"],
      text: "Equipped creature gets +1/+1 and has vigilance and trample.",
    },
  ],
});
