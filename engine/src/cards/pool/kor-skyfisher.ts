import { defineCard } from "../define.js";

// EDHREC rank 13261.
//
// Not targeted: the permanent is chosen as the trigger resolves, and it may be
// Kor Skyfisher itself (the rulings).
const TEXT = "When this creature enters, return a permanent you control to its owner's hand.";

export default defineCard({
  name: "Kor Skyfisher",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a permanent you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
