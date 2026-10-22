import { defineCard } from "../define.js";

// The choice comes after the draw (its ruling). With a land to return, the
// caster picks discarding or returning one; with none, they discard.
export default defineCard({
  name: "Tragic Lesson",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards. Then discard a card unless you return a land you control to its owner's hand.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 1 },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Discard a card", effect: { kind: "discard", target: "you", amount: 1 } },
            {
              text: "Return a land you control to its owner's hand",
              effect: {
                kind: "choose-permanents",
                filter: { type: "land", controlledBy: "you" },
                min: 1,
                upTo: 1,
                then: { kind: "return-to-hand", target: 0 },
                prompt: "Return a land you control to its owner's hand",
              },
            },
          ],
        },
        else: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
});
