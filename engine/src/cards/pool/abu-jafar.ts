import { defineCard } from "../define.js";

// EDHREC rank 21744.

export default defineCard({
  name: "Abu Ja'far",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 0,
  toughness: 1,
  text: "When this creature dies, destroy all creatures blocking or blocked by it. They can't be regenerated.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", blockingRelation: { relation: "either" } },
        cantBeRegenerated: true,
      },
      resolve: null,
      text: "When this creature dies, destroy all creatures blocking or blocked by it. They can't be regenerated.",
    },
  ],
});
