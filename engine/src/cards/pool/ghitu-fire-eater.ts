import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 30795. Voldaren Thrillseeker's shape: the
// power is read as the sacrificed creature last existed (rule 608.2h).

const TEXT = "{T}, Sacrifice this creature: It deals damage equal to its power to any target.";

export default defineCard({
  name: "Ghitu Fire-Eater",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
