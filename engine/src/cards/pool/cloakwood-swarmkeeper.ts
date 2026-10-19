import { defineCard } from "../define.js";

// EDHREC rank 14454.
// Mister Fantastic's batched "one or more tokens you control enter".

const TEXT =
  "Gathered Swarm — Whenever one or more tokens you control enter, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Cloakwood Swarmkeeper",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Ranger"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true }, batched: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
