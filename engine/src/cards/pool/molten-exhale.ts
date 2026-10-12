import { defineCard } from "../define.js";

// EDHREC rank 13403.
//
// "You may cast this spell as though it had flash if you behold a Dragon as
// an additional cost": an optional additional cost (rule 601.2b) — a kicker
// by another name, offered only with a Dragon to behold (701.4a) — whose
// cast may begin any time it could be cast with flash (601.3c). It does the
// same either way.

export default defineCard({
  name: "Molten Exhale",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You may cast this spell as though it had flash if you behold a Dragon as an additional cost to cast it. (To behold a Dragon, choose a Dragon you control or reveal a Dragon card from your hand.)\nMolten Exhale deals 4 damage to target creature or planeswalker.",
  kicker: {
    cost: "",
    keyword: "behold",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon" },
    flash: true,
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 4, target: 0 },
});
