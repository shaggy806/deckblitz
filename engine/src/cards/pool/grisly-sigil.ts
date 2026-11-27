import { defineCard } from "../define.js";

// EDHREC rank 25090. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] If you cast Grisly Sigil targeting a creature or planeswalker that hasn't been
//     dealt noncombat damage this turn, pay its casualty cost and keep the target, the copy deals 1
//     damage and you gain 1 life; then the original resolves and deals 3 damage.
//   [2022-04-29] If you pay the casualty cost of a spell, the copy will resolve before the original
//     spell.
//
// "If it was dealt noncombat damage this turn" is `damagedThisTurnBy: { combat: false }` (rule
// 120.2b), asked as the spell resolves, so the copy's 1 damage makes the original's 3.
export default defineCard({
  name: "Grisly Sigil",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  casualty: 1,
  text:
    "Casualty 1 (As you cast this spell, you may sacrifice a creature with power 1 or greater. When you do, copy this spell and you may choose a new target for the copy.)\n" +
    "Choose target creature or planeswalker. If it was dealt noncombat damage this turn, Grisly Sigil deals 3 damage to it and you gain 3 life. Otherwise, Grisly Sigil deals 1 damage to it and you gain 1 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { damagedThisTurnBy: { combat: false } } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 3, target: 0 },
        { kind: "gain-life", amount: 3 },
      ],
    },
    else: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 1, target: 0 },
        { kind: "gain-life", amount: 1 },
      ],
    },
  },
});
