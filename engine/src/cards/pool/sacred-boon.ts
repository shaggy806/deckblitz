import { defineCard } from "../define.js";

// One delayed ability, set up as this resolves whatever it goes on to prevent,
// that reads the shield's total as it resolves: `damagePreventedThisWay`.
export default defineCard({
  name: "Sacred Boon",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next 3 damage that would be dealt to target creature this turn. At the beginning of the next end step, put a +0/+1 counter on that creature for each 1 damage prevented this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage", target: 0, amount: 3 },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        text: "Put a +0/+1 counter on that creature for each 1 damage prevented this way.",
        effect: { kind: "add-counter", target: 0, counter: "+0/+1", amount: { damagePreventedThisWay: true } },
      },
    ],
  },
});
