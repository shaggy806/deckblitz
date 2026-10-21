import { defineCard } from "../define.js";

// A 0/2 blue Illusion whose blocked creature stays tapped — Mesmerizing
// Benthid's token.
export default defineCard({
  name: "Illusion Token (Freezing Blocker)",
  art: "ccc3d8da-9005-44d9-bb10-18cdac7a32f5",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 0,
  toughness: 2,
  text: "Whenever this token blocks a creature, that creature doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: "Whenever this token blocks a creature, that creature doesn't untap during its controller's next untap step.",
    },
  ],
});
