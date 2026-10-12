import { defineCard } from "../define.js";

export default defineCard({
  name: "Plunder",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  suspend: { n: 4, cost: "{1}{R}" },
  text: "Destroy target artifact or land.\nSuspend 4—{1}{R} (Rather than cast this card from your hand, you may pay {1}{R} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
