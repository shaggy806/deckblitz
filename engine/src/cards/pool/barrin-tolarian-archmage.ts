import { defineCard } from "../define.js";

// Core Set 2021 (M21). The end-step ability is an intervening "if" (rule
// 603.4): it reads the whole turn, before Barrin entered too, and a permanent
// that's left your hand since still counts (the rulings) — the journal's
// "put-into-hand", in its owner's list whoever controlled it. One card
// however many were returned.

const BOUNCE_TEXT = "When Barrin enters, return up to one other target creature or planeswalker to its owner's hand.";
const DRAW_TEXT =
  "At the beginning of your end step, if a permanent was put into your hand from the battlefield this turn, draw a card.";

export default defineCard({
  name: "Barrin, Tolarian Archmage",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${BOUNCE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "put-into-hand" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
