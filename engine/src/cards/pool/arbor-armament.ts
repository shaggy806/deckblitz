import { defineCard } from "../define.js";

// EDHREC rank 17797. Dominaria.

export default defineCard({
  name: "Arbor Armament",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature. That creature gains reach until end of turn. (It can block creatures with flying.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
    ],
  },
});
