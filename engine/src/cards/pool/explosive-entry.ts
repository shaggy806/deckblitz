import { defineCard } from "../define.js";

// EDHREC rank 11014.

export default defineCard({
  name: "Explosive Entry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy up to one target artifact. Put a +1/+1 counter on up to one target creature.",
  targets: [
    { kind: "optional", of: "artifact" },
    { kind: "optional", of: "creature" },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ],
  },
});
