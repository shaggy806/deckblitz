import { defineCard } from "../define.js";

// EDHREC rank 22575.
//
// Rulings:
//   [2022-09-09] You may kick Archangel of Wrath only once for its {B} cost and only once for its
//     {R} cost. You can kick it twice by paying {B}{R}, but you can't kick it twice by paying
//     {B}{B} or {R}{R}. You can't kick it more than twice.
//   [2022-09-09] If it was kicked twice, each of Archangel of Wrath's last two abilities will
//     trigger once. In other words, it will deal 2 damage to each of two targets or deal 2 damage
//     to the same target twice.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.

export default defineCard({
  name: "Archangel of Wrath",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: "Kicker {B} and/or {R} (You may pay an additional {B} and/or {R} as you cast this spell.)\nFlying, lifelink\nWhen this creature enters, if it was kicked, it deals 2 damage to any target.\nWhen this creature enters, if it was kicked twice, it deals 2 damage to any target.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked, it deals 2 damage to any target.",
      condition: { kind: "self-kicked" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, if it was kicked twice, it deals 2 damage to any target.",
      condition: { kind: "self-kicked", with: "both" },
    },
  ],
  kicker: { cost: "{B}", second: "{R}" },
});
