import { defineCard } from "../define.js";

const ETB = "When this creature enters, you may return a land you control to its owner's hand.";

export default defineCard({
  name: "Tazeem Raptor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        min: 0,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "You may return a land you control to its owner's hand",
      },
      resolve: null,
      text: ETB,
    },
  ],
});
