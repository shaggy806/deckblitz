import { defineCard } from "../define.js";

const TEXT = "At the beginning of combat on your turn, if a card was put into exile this turn, put a +1/+1 counter on this token.";

/** Ashiok, Wicked Manipulator's −2. */
export default defineCard({
  name: "Nightmare Token (Ashiok, Wicked Manipulator)",
  tokenName: "Nightmare Token",
  art: "858428ee-3a9c-4dfc-84c2-751e59df2ed7",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      // An intervening "if" (rule 603.4): any card, from anywhere, by anyone.
      condition: { kind: "turn-stat", stat: "cards-put-into-exile", who: "any-player", atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
