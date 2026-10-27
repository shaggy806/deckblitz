import { defineCard } from "../define.js";

const TEXT =
  "Whenever another permanent you control becomes the target of a spell or ability an opponent controls, you may return that permanent to its owner's hand.";

export default defineCard({
  name: "Cloud Cover",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", otherOnly: true, byOpponentOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return that permanent to its owner's hand?",
        effect: { kind: "return-to-hand", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
