import { defineCard } from "../define.js";

// EDHREC rank 18589. Marvel Super Heroes Commander.
//
// "If you do" is the discard having happened (Improvised Act's `this-way`
// gate): with an empty hand nothing is discarded and no opponent discards.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may discard a card. If you do, each opponent discards a card.";

export default defineCard({
  name: "Green Goblin, Back for More",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Human", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "menace"],
  mayhem: { cost: "{3}{B}{B}" },
  text:
    `Flying, menace\n${COMBAT_TEXT}\n` +
    "Mayhem {3}{B}{B} (You may cast this card from your graveyard for {3}{B}{B} if you discarded it this turn. Timing rules still apply.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to have each opponent discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "discard", target: "each-opponent", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
