import { defineCard } from "../define.js";

// Browbeat's shape: a rhystic `unless` whose option is `takeDamage`.

export default defineCard({
  name: "Breaking Point",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Any player may have Breaking Point deal 6 damage to them. If no one does, destroy all creatures. Creatures destroyed this way can't be regenerated.",
  targets: [],
  effect: {
    kind: "unless",
    chooser: "any-player",
    options: [{ takeDamage: 6, text: "Have Breaking Point deal 6 damage to you" }],
    otherwise: { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
  },
});
