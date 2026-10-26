import { defineCard } from "../define.js";

const PUMP = "Equipped creature gets +2/+1.";
const ENTERS = "Whenever a creature you control enters, attach this Equipment to that creature.";

export default defineCard({
  name: "Ronin Warclub",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${ENTERS}\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {5}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "attach", target: "trigger-object" },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 1], text: PUMP }],
});
