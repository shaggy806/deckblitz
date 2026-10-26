import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 13759.
//
// "Put into your graveyard from the battlefield": any nontoken permanent its
// controller owns (Magus of the Bridge's filter, without the creature type).
// The control change has no duration (Jinxed Idol's shape).

const DIES_TEXT =
  "Whenever a nontoken permanent is put into your graveyard from the battlefield, this artifact deals 1 damage to you.";
const SAC_TEXT = "Sacrifice a creature: Target opponent gains control of this artifact.";

export default defineCard({
  name: "Jinxed Ring",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${DIES_TEXT}\n${SAC_TEXT} (This effect lasts indefinitely.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      targets: ["opponent"],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { token: false, ownedBy: "you" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
