import { defineCard } from "../define.js";

const TEXT = "At the beginning of your end step, put a +1/+1 counter on target Beast creature you control.";

export default defineCard({
  name: "Advocate of the Beast",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Beast" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
