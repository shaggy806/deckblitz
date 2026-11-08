import { defineCard } from "../define.js";

// EDHREC rank 31408.

export default defineCard({
  name: "Street Sweeper",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 6,
  text: "Whenever this creature attacks, destroy all Auras attached to target land.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy-all", filter: { subtype: "Aura", attachedToObject: 0 } },
      resolve: null,
      text: "Whenever this creature attacks, destroy all Auras attached to target land.",
    },
  ],
});
