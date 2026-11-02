import { defineCard } from "../define.js";

export default defineCard({
  name: "Exquisite Firecraft",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  cantBeCountered: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
  text: "Exquisite Firecraft deals 4 damage to any target.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, this spell can't be countered.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
