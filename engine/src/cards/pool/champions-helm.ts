import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const PUMP = "Equipped creature gets +2/+2.";
const HEXPROOF = "As long as equipped creature is legendary, it has hexproof.";

export default defineCard({
  name: "Champion's Helm",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${HEXPROOF}\nEquip {1}`,
  activated: [equip("{1}")],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 2], text: PUMP },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { supertype: "legendary" } } },
      grantKeywords: ["hexproof"],
      text: HEXPROOF,
    },
  ],
});
