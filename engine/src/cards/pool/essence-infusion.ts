import { defineCard } from "../define.js";

// EDHREC rank 18961.

export default defineCard({
  name: "Essence Infusion",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put two +1/+1 counters on target creature. It gains lifelink until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
