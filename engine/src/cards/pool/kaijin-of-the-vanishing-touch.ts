import { defineCard } from "../define.js";

// "That creature" is the one it blocks (`blocks`'s `object: "blocked"`),
// returned at end of combat by a delayed trigger only if it's still the same
// creature on the battlefield (rule 400.7).
const T0 = "Whenever this creature blocks a creature, return that creature to its owner's hand at end of combat. (Return it only if it's on the battlefield.)";

export default defineCard({
  name: "Kaijin of the Vanishing Touch",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${T0}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "delayed-trigger", at: "end-of-combat", effect: { kind: "return-to-hand", target: "trigger-object" }, text: "Return that creature to its owner's hand." },
      resolve: null,
      text: T0,
    },
  ],
});
