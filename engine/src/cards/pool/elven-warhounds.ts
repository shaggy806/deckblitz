import { defineCard } from "../define.js";

// EDHREC rank 21104.

const TEXT =
  "Whenever this creature becomes blocked by a creature, put that creature on top of its owner's library.";

export default defineCard({
  name: "Elven Warhounds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
