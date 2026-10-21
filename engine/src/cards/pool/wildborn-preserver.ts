import { defineCard } from "../define.js";

// EDHREC rank 9427. Remnant of the Rising Star's shape: a `may` paying {X},
// its reflexive trigger reading that X (the ruling: "When you do" resolves
// separately), the counters going on this creature.

const TEXT =
  "Whenever another non-Human creature you control enters, you may pay {X}. When you do, put X +1/+1 counters on this creature.";

export default defineCard({
  name: "Wildborn Preserver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "reach"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nReach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", notSubtypes: ["Human"] },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to put X +1/+1 counters on Wildborn Preserver?",
        cost: "{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
          text: "When you do, put X +1/+1 counters on this creature.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
