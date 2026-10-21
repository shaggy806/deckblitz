import { defineCard } from "../define.js";

export default defineCard({
  name: "Battlefield Promotion",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature. That creature gains first strike until end of turn. You gain 2 life. (A creature with first strike deals combat damage before creatures without first strike.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
