import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Whenever this enchantment or another enchantment you control enters, you may put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Oath of the Ancient Wood",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on the target creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
