import { defineCard } from "../define.js";

// EDHREC rank 20393. Contract Hero's shape: the "may" is whether to pay at
// all, the mode which cost, and "if you do" reads what was sacrificed or
// discarded this way — so choosing a cost that can't be paid (no artifact, an
// empty hand) gets nothing.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice an artifact or discard a card. If you do, draw a card and this creature gets +2/+0 until end of turn.";
const REWARD = {
  kind: "sequence",
  effects: [
    { kind: "draw", amount: 1 },
    { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
  ],
} as const;

export default defineCard({
  name: "Reckless Detective",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil", "Detective"],
  power: 0,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice an artifact or discard a card to draw a card and give this creature +2/+0?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Sacrifice an artifact.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 },
                  { kind: "conditional", condition: { kind: "this-way", what: "sacrificed", who: "you" }, then: REWARD },
                ],
              },
            },
            {
              text: "Discard a card.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "discard", target: "you", amount: 1 },
                  { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: REWARD },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
