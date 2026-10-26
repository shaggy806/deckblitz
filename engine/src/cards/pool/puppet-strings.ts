import { defineCard } from "../define.js";

// EDHREC rank 9658.

export default defineCard({
  name: "Puppet Strings",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: You may tap or untap target creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap target creature.", effect: { kind: "tap", target: 0 } },
          { text: "Untap target creature.", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: "{2}, {T}: You may tap or untap target creature.",
    },
  ],
});
