import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 17244. With its one target illegal the whole
// spell doesn't resolve (rule 608.2b), so no damage to you either.

export default defineCard({
  name: "Aftershock",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target artifact, creature, or land. Aftershock deals 3 damage to you.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "damage", amount: 3, who: "you" },
    ],
  },
});
