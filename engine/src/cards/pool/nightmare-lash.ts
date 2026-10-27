import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 11068.

const PUMP_TEXT = "Equipped creature gets +1/+1 for each Swamp you control.";

export default defineCard({
  name: "Nightmare Lash",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\nEquip—Pay 3 life. (Pay 3 life: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Swamp", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 3 },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip—Pay 3 life.",
      sorcerySpeed: true,
    },
  ],
});
