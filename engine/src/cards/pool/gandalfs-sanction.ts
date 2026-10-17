import { defineCard } from "../define.js";

// Rulings: X is counted before the spell itself reaches the graveyard;
// "excess" is beyond lethal (toughness less damage marked), ignoring
// indestructible and prevention, and both parts are dealt at once —
// `excessToController`, as Ram Through without its trample condition.
export default defineCard({
  name: "Gandalf's Sanction",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  text: "Gandalf's Sanction deals X damage to target creature, where X is the number of instant and sorcery cards in your graveyard. Excess damage is dealt to that creature's controller instead.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    amount: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
    target: 0,
    excessToController: {},
  },
});
