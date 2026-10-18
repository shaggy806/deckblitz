import { defineCard } from "../define.js";

// EDHREC rank 7249. March of the Machine Commander.
//
// Rulings:
//   [2023-04-14] You choose the value of X as the first triggered ability resolves.
//   [2023-04-14] As the last ability resolves, you choose whether to pay 4 life. You can’t pay it
//     more than once to create additional Vampire Knight tokens.
//
// The attack trigger is Flameblast Dragon's `may` with an `{X}` cost, X
// chosen as the `may` is answered (the first ruling). The end-step trigger
// fires at every player's end step; "cards you've drawn this turn" is the
// controller's turn tally, read as it resolves.

const ATTACK_TEXT = "Whenever Elenda and Azor attacks, you may pay {X}{W}{U}{B}. If you do, draw X cards.";
const END_TEXT =
  "At the beginning of each end step, you may pay 4 life. If you do, create a number of 1/1 black Vampire Knight creature tokens with lifelink equal to the number of cards you've drawn this turn.";

export default defineCard({
  name: "Elenda and Azor",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight", "Sphinx"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying, ward {2}\n${ATTACK_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X}{W}{U}{B} to draw X cards?",
        cost: "{X}{W}{U}{B}",
        effect: { kind: "draw", amount: "x" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay 4 life to create a 1/1 Vampire Knight for each card you've drawn this turn?",
        costLife: 4,
        effect: {
          kind: "create-token",
          token: "Vampire Knight Token",
          count: { turnStat: "cards-drawn", who: "you" },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
