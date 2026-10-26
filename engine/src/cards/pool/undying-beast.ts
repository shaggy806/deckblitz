import { defineCard } from "../define.js";

// EDHREC rank 31958.

const TEXT = "When this creature dies, put it on top of its owner's library.";

export default defineCard({
  name: "Undying Beast",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
