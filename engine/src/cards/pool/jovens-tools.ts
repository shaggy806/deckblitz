import { defineCard } from "../define.js";

// "Except by Walls": a rule on the creature for the turn (it outlasts a loss
// of abilities), read when blockers are declared.
export default defineCard({
  name: "Joven's Tools",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "{4}, {T}: Target creature can't be blocked this turn except by Walls.",
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [],
        cantBeBlockedBy: { notSubtypes: ["Wall"] },
      },
      resolve: null,
      text: "{4}, {T}: Target creature can't be blocked this turn except by Walls.",
    },
  ],
});
