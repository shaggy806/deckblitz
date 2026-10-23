import { defineCard } from "../define.js";

// EDHREC rank 14136.
//
// Rulings:
//   [2016-04-08] A sorcery can't be put onto the battlefield and a permanent can't transform into
//     a sorcery. If an effect exiles Persistent Nightmare and then instructs you to return it to
//     the battlefield, it remains face up in exile (unless that effect instructs you to put it
//     onto the battlefield transformed, in which case it returns as Persistent Nightmare). If an
//     effect instructs you to transform Persistent Nightmare, the instruction is ignored.
//   [2016-04-08] If you cause a creature to have 0 power or less, use the actual value (which may
//     be negative) to determine whether it can block or be blocked. A creature with skulk and 0 or
//     less power most likely won't be blocked, but it won't deal combat damage and won't trigger
//     any abilities that trigger when combat damage is dealt.
//   [2016-04-08] Skulk matters only as blockers are chosen. Modifying either creature's power
//     after blockers are chosen won't cause the attacking creature to become unblocked.

export default defineCard({
  name: "Startled Awake",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target opponent mills thirteen cards.\n{3}{U}{U}: Put this card from your graveyard onto the battlefield transformed. Activate only as a sorcery.",
  targets: ["opponent"],
  effect: { kind: "mill", target: 0, amount: 13 },
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      zone: "graveyard",
      staysInZone: true,
      effect: { kind: "put-onto-battlefield", target: "source", transformed: true },
      resolve: null,
      text: "{3}{U}{U}: Put this card from your graveyard onto the battlefield transformed. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  faces: ["Startled Awake", "Persistent Nightmare"],
  transform: true,
});
