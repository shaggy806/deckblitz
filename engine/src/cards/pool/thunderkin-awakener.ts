import { defineCard } from "../define.js";

// EDHREC rank 20678.
//
// The target's toughness is compared with this creature's as it's chosen and
// again as the ability resolves (the ruling) — `toughnessOf: "source"`, read
// as it last existed if it has left. The card enters tapped and attacking a
// player or planeswalker its controller chooses (`attacking: "choose"`); it
// was never declared, so attack triggers don't see it. The delayed sacrifice
// is about the permanent this put onto the battlefield (Vindictive Triumph's
// `about`), so one that left and came back is a new object it doesn't touch
// (rule 400.7).
//
// Rulings:
//   [2019-07-12] You choose which player or planeswalker the returned creature is attacking. It
//     doesn't have to be attacking the same player or planeswalker that Thunderkin Awakener is
//     attacking.
//   [2019-07-12] The target card must have lesser toughness both as Thunderkin Awakener attacks
//     and as its triggered ability resolves.
//   [2019-07-12] If the new creature leaves the battlefield before the end step, that card remains
//     in its current zone. It won't be sacrificed.

const ATTACKS =
  "Whenever this creature attacks, choose target Elemental creature card in your graveyard with toughness less than this creature's toughness. Return that card to the battlefield tapped and attacking. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Thunderkin Awakener",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 1,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            type: "creature",
            subtype: "Elemental",
            toughness: { op: "lt", n: { amount: { toughnessOf: "source" } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "put-onto-battlefield",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice it.",
          },
        ],
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
