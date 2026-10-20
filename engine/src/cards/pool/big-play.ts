import { defineCard } from "../define.js";

// EDHREC rank 19744.
export default defineCard({
  name: "Big Play",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains reach until end of turn. Put a +1/+1 counter on it. (A creature with reach can block creatures with flying.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    ],
  },
});
