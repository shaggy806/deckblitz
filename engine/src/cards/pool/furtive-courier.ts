import { defineCard } from "../define.js";

// "Can't be blocked" matters only as blockers are declared: sacrificing an
// artifact after it's blocked doesn't unblock it (the ruling). The sacrificed
// artifact is read as it last existed, so a Clue token counts.

const UNBLOCKABLE_TEXT = "This creature can't be blocked as long as you've sacrificed an artifact this turn.";
const ATTACK_TEXT = "Whenever this creature attacks, draw a card, then discard a card.";

export default defineCard({
  name: "Furtive Courier",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Advisor"],
  power: 3,
  toughness: 2,
  text: `${UNBLOCKABLE_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you", filter: { type: "artifact" } },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
