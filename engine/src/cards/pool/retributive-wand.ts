import { defineCard } from "../define.js";

// EDHREC rank 23510. The second ability gives no way to sacrifice it (the
// ruling): it fires only when something else puts it into a graveyard.

const PING_TEXT = "{3}, {T}: This artifact deals 1 damage to any target.";
const DIES_TEXT = "When this artifact is put into a graveyard from the battlefield, it deals 5 damage to any target.";

export default defineCard({
  name: "Retributive Wand",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${PING_TEXT}\n${DIES_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
