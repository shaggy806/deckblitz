import { defineCard } from "../define.js";

export default defineCard({
  name: "Meteoric Mace",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +4/+0 and has trample.\nEquip {4}\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 0],
      grantKeywords: ["trample"],
      text: "Equipped creature gets +4/+0 and has trample.",
    },
  ],
});
