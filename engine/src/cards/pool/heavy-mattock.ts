import { defineCard } from "../define.js";

// EDHREC rank 26719.

const PUMP_TEXT = "Equipped creature gets +1/+1.";
const HUMAN_TEXT = "As long as equipped creature is a Human, it gets an additional +1/+1.";

export default defineCard({
  name: "Heavy Mattock",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${HUMAN_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Human" } } },
      grantPt: [1, 1],
      text: HUMAN_TEXT,
    },
  ],
});
