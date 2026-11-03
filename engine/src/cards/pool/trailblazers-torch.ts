import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Commander Legends: Battle for Baldur's Gate (CLB). EDHREC rank 11298.
//
// The equipped creature deals the damage and the creatures blocking it take
// it, both read off the trigger object: an Equipment moved in response still
// means the creature that became blocked.
const ENTER_TEXT = "When this Equipment enters, you take the initiative.";
const BLOCKED_TEXT = "Whenever equipped creature becomes blocked, it deals 2 damage to each creature blocking it.";

export default defineCard({
  name: "Trailblazer's Torch",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${BLOCKED_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: [],
      effect: {
        kind: "damage-all",
        amount: 2,
        filter: { type: "creature", blockingRelation: { relation: "blocking", of: "trigger-object" } },
        from: "trigger-object",
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
