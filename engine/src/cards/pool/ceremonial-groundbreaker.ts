import { defineCard } from "../define.js";

// EDHREC rank 25980. Streets of New Capenna. "Equip Citizen {1}" is an equip
// whose target is narrowed to a Citizen you control (Blackblade Reforged's
// "Equip legendary creature"), checked on activation and resolution.
export default defineCard({
  name: "Ceremonial Groundbreaker",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+1 and has trample.\nEquip Citizen {1}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +2/+1 and has trample.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Citizen" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Citizen {1}",
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
});
