import { defineCard } from "../define.js";

export default defineCard({
  name: "Tower of Coireall",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Target creature can't be blocked by Walls this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: [], cantBeBlockedBy: { subtype: "Wall" } },
      resolve: null,
      text: "{T}: Target creature can't be blocked by Walls this turn.",
    },
  ],
});
