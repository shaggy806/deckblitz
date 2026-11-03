import { defineCard } from "../define.js";

// The alternative cost's condition reads every creature on the battlefield as
// the spell is proposed. Each player chooses thirteen, or all they have.

export default defineCard({
  name: "Blasphemous Edict",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You may pay {B} rather than pay this spell's mana cost if there are thirteen or more creatures on the battlefield.\nEach player sacrifices thirteen creatures of their choice.",
  alternativeCost: {
    mana: "{B}",
    condition: { kind: "controls", filter: { type: "creature" }, atLeast: 13, anyController: true },
  },
  effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 13 },
});
