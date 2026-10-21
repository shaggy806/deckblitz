import { defineCard } from "../define.js";

// EDHREC rank 14165.
//
// Cloakwood Swarmkeeper's batched token entry, with Ingenious Artillerist's
// "that many" — the count of tokens that entered together, even if some
// have left by the time it resolves (the ruling).

const TEXT = "Whenever one or more tokens you control enter, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Woodland Champion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true }, batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
