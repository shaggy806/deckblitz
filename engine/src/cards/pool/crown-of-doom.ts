import { defineCard } from "../define.js";

// EDHREC rank 9201.
//
// "Target player other than this artifact's owner" is an `other` player slot
// `than: "source-owner"`: its owner never changes (rule 108.3), so whoever
// controls it may pass it to anyone but its owner, who never gets it back this
// way. The control effect lasts as long as it stays on the battlefield (rule
// 613.1b). "You" in the attack trigger is its controller now.

const ATTACK = "Whenever a creature attacks you or a planeswalker you control, it gets +2/+0 until end of turn.";
const PASS = "{2}: Target player other than this artifact's owner gains control of it. Activate only during your turn.";

export default defineCard({
  name: "Crown of Doom",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ATTACK}\n${PASS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { type: "creature" }, attackingYou: true },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "other", of: "player", than: "source-owner" }],
      effect: { kind: "gain-control", target: "source", who: { target: 0 }, untilEndOfTurn: false },
      condition: { kind: "your-turn" },
      resolve: null,
      text: PASS,
    },
  ],
});
