import { defineCard } from "../define.js";

export default defineCard({
  name: "Umbral Mantle",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature has \"{3}, {Q}: This creature gets +2/+2 until end of turn.\" ({Q} is the untap symbol.)\nEquip {0}",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {0}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{3}", tap: false, untap: true },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          resolve: null,
          text: "{3}, {Q}: This creature gets +2/+2 until end of turn.",
        },
      ],
      text: 'Equipped creature has "{3}, {Q}: This creature gets +2/+2 until end of turn."',
    },
  ],
});
