import { defineCard } from "../define.js";

// EDHREC rank 12637.
// The target is chosen as the trigger goes on the stack (one of your own if
// those are the only other creatures); whether it's returned is chosen as it
// resolves (the ruling).
const FACE_UP_TEXT =
  "When this creature is turned face up, you may return another target creature to its owner's hand.";

export default defineCard({
  name: "Icefeather Aven",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Bird", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{1}{G}{U}" },
  text: `Flying\nMorph {1}{G}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Return the targeted creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
