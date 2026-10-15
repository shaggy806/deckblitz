import { defineCard } from "../define.js";

// EDHREC rank 28650.
//
// Vision of Love's shape: "if you do" follows whichever was chosen, so a
// branch that couldn't be done (no artifact, an empty hand) pumps nothing.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice an artifact or discard a card. If you do, this creature gets +2/+0 until end of turn.";
const PUMP = { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" } as const;

export default defineCard({
  name: "Contract Hero",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Hero"],
  power: 2,
  toughness: 3,
  text: `When this creature enters, create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Treasure token.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice an artifact or discard a card to give this creature +2/+0?",
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
                  { kind: "conditional", condition: { kind: "this-way", what: "sacrificed", who: "you" }, then: PUMP },
                ],
              },
            },
            {
              text: "Discard a card.",
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "discard", target: "you", amount: 1 },
                  { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: PUMP },
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
