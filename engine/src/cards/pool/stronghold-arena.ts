import { defineCard } from "../define.js";

// EDHREC rank 18210.
//
// Rulings:
//   [2022-09-09] As Stronghold Arena's last ability resolves, you don't get to see what the card
//     of your library is before deciding whether to reveal it. If you choose to reveal it, you
//     must put it into your hand and will lose life.
//   [2022-09-09] Normally, combat damage is dealt all at the same time. In that case, Stronghold
//     Arena's last ability triggers once for each opponent that creatures you control dealt combat
//     damage to, regardless of how many creatures were dealing that damage. If any of those
//     creatures have double strike or first strike, the ability will trigger once for each
//     opponent dealt damage in each combat damage step.
//   [2022-09-09] You may kick Stronghold Arena only once for its {G} cost and only once for its
//     {W} cost. You can kick it twice by paying {G}{W}, but you can't kick it twice by paying
//     {G}{G} or {W}{W}. You can't kick it more than twice.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.

export default defineCard({
  name: "Stronghold Arena",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Kicker {G} and/or {W} (You may pay an additional {G} and/or {W} as you cast this spell.)\nWhen this enchantment enters, you gain 3 life for each time it was kicked.\nWhenever one or more creatures you control deal combat damage to a player, you may reveal the top card of your library and put it into your hand. If you do, you lose life equal to its mana value.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [3, { timesKicked: "source" }] } },
      resolve: null,
      text: "When this enchantment enters, you gain 3 life for each time it was kicked.",
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature" },
        combat: true,
      },
      targets: [],
      // Decided before seeing the card (the ruling), so a `may` around a
      // forced pick of the top card.
      effect: {
        kind: "may",
        prompt: "Reveal the top card of your library and put it into your hand, losing life equal to its mana value?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          reveal: true,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
          then: { kind: "lose-life", who: "you", amount: { manaValueOf: 0 } },
        },
      },
      resolve: null,
      text: "Whenever one or more creatures you control deal combat damage to a player, you may reveal the top card of your library and put it into your hand. If you do, you lose life equal to its mana value.",
    },
  ],
  kicker: { cost: "{G}", second: "{W}" },
});
