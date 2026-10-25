import { defineCard } from "../define.js";

// EDHREC rank 21750. Any creature, an untapped one included (the ruling).

export default defineCard({
  name: "Dragonscale Boon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put two +1/+1 counters on target creature and untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "untap", target: 0 },
    ],
  },
});
