import { defineCard } from "../define.js";

// EDHREC rank 10961.
//
// An intervening "if" (rule 603.4): another Elf entered under your control
// this turn, asked as combat begins and again as it resolves. "Your
// Ring-bearer" is the one chosen as the Ring tempted you just before.

const TEXT =
  "Will of the council — At the beginning of combat on your turn, if another Elf entered the battlefield under your control this turn, starting with you, each player votes for dominion or guidance. If dominion gets more votes, the Ring tempts you, then you put a +1/+1 counter on your Ring-bearer. If guidance gets more votes or the vote is tied, draw a card.";

export default defineCard({
  name: "Galadriel, Elven-Queen",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "turn-history", what: "entered", who: "you", filter: { subtype: "Elf" }, excludeSelf: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["dominion", "guidance"] } },
          {
            kind: "conditional",
            condition: { kind: "vote-won", option: 0 },
            then: {
              kind: "sequence",
              effects: [
                { kind: "the-ring-tempts-you" },
                {
                  kind: "add-counter-all",
                  filter: { ringBearer: true, controlledBy: "you" },
                  counter: "+1/+1",
                  amount: 1,
                },
              ],
            },
            else: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
