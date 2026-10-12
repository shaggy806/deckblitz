import { defineCard } from "../define.js";

// EDHREC rank 12232.

export default defineCard({
  name: "Shortcut to Mushrooms",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "When this enchantment enters, the Ring tempts you.\nAt the beginning of your end step, if a permanent you controlled left the battlefield this turn, put a +1/+1 counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: "When this enchantment enters, the Ring tempts you.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if a permanent you controlled left the battlefield this turn, put a +1/+1 counter on target creature you control.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
