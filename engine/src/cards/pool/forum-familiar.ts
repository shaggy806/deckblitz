import { defineCard } from "../define.js";

// EDHREC rank 21371.
//
// Rulings:
//   [2024-02-02] If the target of Forum Familiar's last ability is illegal when the ability tries
//     to resolve, it won't resolve and none of its effects will happen. You won't put a +1/+1
//     counter on Forum Familiar.

const DISGUISE =
  "Disguise {1}{W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, return another target permanent you control to its owner's hand and put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Forum Familiar",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: `${DISGUISE}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{1}{W}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
