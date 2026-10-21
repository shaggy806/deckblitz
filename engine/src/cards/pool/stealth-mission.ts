import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 15840.

export default defineCard({
  name: "Stealth Mission",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature you control. That creature can't be blocked this turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
});
