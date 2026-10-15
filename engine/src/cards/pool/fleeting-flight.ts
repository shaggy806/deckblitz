import { defineCard } from "../define.js";

// EDHREC rank 8581.

export default defineCard({
  name: "Fleeting Flight",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature. It gains flying until end of turn. Prevent all combat damage that would be dealt to it this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "prevent-damage", target: 0, amount: "all", combatOnly: true },
    ],
  },
});
