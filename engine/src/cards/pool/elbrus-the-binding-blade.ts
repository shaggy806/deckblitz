import { defineCard } from "../define.js";

// EDHREC rank 9858. It transforms even if it can't be unattached (its ruling).
export default defineCard({
  name: "Elbrus, the Binding Blade",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0.\nWhen equipped creature deals combat damage to a player, unattach Elbrus, then transform it.\nEquip {1}",
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
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "unattach", target: "source" },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: "When equipped creature deals combat damage to a player, unattach Elbrus, then transform it.",
    },
  ],
  faces: ["Elbrus, the Binding Blade", "Withengar Unbound"],
  transform: true,
});
