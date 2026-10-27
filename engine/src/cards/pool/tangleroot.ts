import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 17419.
// The caster gets the {G} whether they want it or not (the ruling).

const TEXT = "Whenever a player casts a creature spell, that player adds {G}.";

export default defineCard({
  name: "Tangleroot",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
