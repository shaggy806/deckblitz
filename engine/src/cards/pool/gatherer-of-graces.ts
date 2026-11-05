import { defineCard } from "../define.js";

// EDHREC rank 24991.

export default defineCard({
  name: "Gatherer of Graces",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 2,
  text: "This creature gets +1/+1 for each Aura attached to it.\nSacrifice an Aura: Regenerate this creature.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Aura" } } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Sacrifice an Aura: Regenerate this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each Aura attached to it.",
    },
  ],
});
