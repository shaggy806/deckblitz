import { defineCard } from "../define.js";

// EDHREC rank 30438.
//
// Rulings:
//   [2004-10-04] If the target creature is not on the battlefield (or is not a creature) at the
//     time the damage would be redirected, then the damage goes on this card.
//   [2004-10-04] The ability applies to the next time damage is dealt. Normally this means damage
//     from one source at one time, but during combat it is possible for multiple sources to damage
//     the Treefolk at one time, in which case damage from all of those sources is redirected.

export default defineCard({
  name: "Mirrorwood Treefolk",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 2,
  toughness: 4,
  text: "{2}{R}{W}: The next time damage would be dealt to this creature this turn, that damage is dealt to any target instead.",
  activated: [
    {
      cost: { mana: "{2}{R}{W}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage-rule", to: { target: "source" }, amount: "next-time", redirectTo: 0 },
      resolve: null,
      text: "{2}{R}{W}: The next time damage would be dealt to this creature this turn, that damage is dealt to any target instead.",
    },
  ],
});
