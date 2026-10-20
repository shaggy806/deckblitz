import { defineCard } from "../define.js";

// EDHREC rank 24457.
//
// "Return up to two lands you control" isn't targeted: they're chosen as the
// ability resolves (`choose-permanents`).

const ENTER_TEXT = "When this creature enters, return up to two lands you control to their owner's hand.";

export default defineCard({
  name: "Kazandu Stomper",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: 2,
        min: 0,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return up to two lands you control to their owner's hand",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
