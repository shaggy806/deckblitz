import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20812.

const ETB_TEXT = "When this Equipment enters, it deals 2 damage to any target and 1 damage to you.";
const STATIC_TEXT = "Equipped creature gets +1/+0 and has menace.";

export default defineCard({
  name: "Daredevil's Billy Club",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `${ETB_TEXT}\n${STATIC_TEXT} (It can't be blocked except by two or more creatures.)\n` +
    "Equip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
