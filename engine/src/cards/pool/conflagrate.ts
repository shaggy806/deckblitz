import { defineCard } from "../define.js";

// Rulings:
//   [2021-03-19] You divide the damage as you cast Conflagrate, not as it resolves. Each target
//     must be assigned at least 1 damage. You can't choose more than X targets and assign 0
//     damage to a target.
//   [2021-03-19] If X is 0, Conflagrate has no targets and deals no damage.
//
// Flashback's X is announced for the cast though its mana has none (rule 107.3a):
// the cards discarded, and the damage divided.
export default defineCard({
  name: "Conflagrate",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Conflagrate deals X damage divided as you choose among any number of targets.\nFlashback—{R}{R}, Discard X cards. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "any-number", of: "any-target", max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
  flashback: { cost: "{R}{R}", discard: "x" },
});
