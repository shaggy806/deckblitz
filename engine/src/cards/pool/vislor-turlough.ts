import { defineCard } from "../define.js";

// The goader is you, whoever comes to control it: that opponent's creature has
// to attack and, if able, not you. Control lost, the goad is over, and getting
// it back doesn't bring it back (rule 611.2b).
const ENTERS_TEXT =
  "Deal with the Black Guardian — When Vislor Turlough enters, you may have an opponent gain control of it. If you do, it's goaded for as long as they control it.";
const END_TEXT = "At the beginning of your end step, draw a card, then you lose life equal to the number of cards in your hand.";

export default defineCard({
  name: "Vislor Turlough",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rogue"],
  power: 2,
  toughness: 5,
  pairing: { kind: "doctors-companion" },
  text: `${ENTERS_TEXT}\n${END_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have an opponent gain control of Vislor Turlough? It's goaded for as long as they control it.",
        effect: {
          kind: "choose-opponent",
          then: {
            kind: "sequence",
            effects: [
              { kind: "gain-control", target: "source", who: "that-player", untilEndOfTurn: false },
              { kind: "goad", target: "source", duration: "while-its-controller-controls-source" },
            ],
          },
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: { cardsInHand: "you" } },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
