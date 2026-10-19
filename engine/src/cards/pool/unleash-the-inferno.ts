import { defineCard } from "../define.js";

// Streets of New Capenna Commander.
//
// Rulings:
//   [2022-04-29] A permanent cannot be dealt 0 excess damage.
//   [2022-04-29] Excess damage has been dealt to a planeswalker if the amount of damage dealt to it
//     is greater than the number of loyalty counters that it had remaining when the damage was
//     dealt.
//   [2022-04-29] Excess damage has been dealt to a creature if the damage dealt to it is greater
//     than lethal damage. Usually, this means damage greater than its toughness, although damage
//     already marked on the creature is taken into account.
//
// Bolg of the North's "if excess damage was dealt this way" (rule 120.4a —
// past lethal, damage already marked counted; past loyalty for a
// planeswalker), and "when it deals excess damage this way" is a reflexive
// ability (rule 603.12) whose target's mana-value bound is that excess,
// fixed by the spell's resolution as the ability triggers (Argentum
// Masticore's `thisWay` bound).
const TEXT =
  "Unleash the Inferno deals 7 damage to target creature or planeswalker. When it deals excess damage this way, destroy target artifact or enchantment an opponent controls with mana value less than or equal to that amount of excess damage.";
const REFLEXIVE_TEXT =
  "When it deals excess damage this way, destroy target artifact or enchantment an opponent controls with mana value less than or equal to that amount of excess damage.";

export default defineCard({
  name: "Unleash the Inferno",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 7, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "excess-damage-this-way" },
        then: {
          kind: "reflexive-trigger",
          targets: [
            {
              kind: "permanent",
              whose: "opponent",
              filter: {
                typesAnyOf: ["artifact", "enchantment"],
                manaValue: { op: "lte", n: { amount: { excessDamageThisWay: true } } },
              },
            },
          ],
          effect: { kind: "destroy", target: 0 },
          text: REFLEXIVE_TEXT,
        },
      },
    ],
  },
});
