import { defineCard } from "../define.js";

// Rulings:
//   Only one artifact may be sacrificed — no more counters or life loss for more.
//   The choice is made as the ability resolves, and nothing can happen between
//     the sacrifice and the counters and life loss.
const ENTERS =
  "When this creature enters, you may sacrifice an artifact. If you do, put two +1/+1 counters on this creature and each opponent loses 2 life.";

export default defineCard({
  name: "Ironclad Revolutionary",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Artificer"],
  power: 4,
  toughness: 4,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        prompt: "Sacrifice an artifact to put two +1/+1 counters on Ironclad Revolutionary and make each opponent lose 2 life?",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            { kind: "lose-life", amount: 2, who: "each-opponent" },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
