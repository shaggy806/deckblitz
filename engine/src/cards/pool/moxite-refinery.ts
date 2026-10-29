import { defineCard } from "../define.js";

// EDHREC rank 5105.

export default defineCard({
  name: "Moxite Refinery",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Remove X counters from an artifact or creature you control: Choose one. Activate only as a sorcery.\n• Put X charge counters on target artifact.\n• Put X +1/+1 counters on target creature.",
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: true,
        removeCounter: { kind: "any", count: "x", from: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put X charge counters on target artifact.",
            targets: ["artifact"],
            effect: { kind: "add-counter", target: 0, counter: "charge", amount: "x" },
          },
          {
            text: "Put X +1/+1 counters on target creature.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
          },
        ],
      },
      resolve: null,
      text: "{2}, {T}, Remove X counters from an artifact or creature you control: Choose one. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
