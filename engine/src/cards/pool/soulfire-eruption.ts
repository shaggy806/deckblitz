import { defineCard } from "../define.js";

// Commander Legends (CMR). EDHREC rank 7834.
//
// Rulings:
//   The targets are handled one at a time in turn order: first the active
//     player and the permanents they control, in an order you choose, then
//     the next player's group, and so on. For whichever target you select,
//     exile the top card of your library, then deal the damage to it.
//   With the top card revealed (Courser of Kruphix), you see the new top card
//     before selecting the next target of a group.
//   Nothing happens between the damage dealt to each target; triggers wait
//     until it has finished resolving.
//
// `turnOrder` groups the targets by player from the active player and asks
// the next of a group of two or more as it goes (the choice is made after the
// exile before it); `ownThisWay` makes "that card" the one this target's turn
// exiled alone. The permission is granted as each card is exiled: nothing
// happens in between, so the closing sentence's "the exiled cards" are those.

const TEXT =
  "Choose any number of target creatures, planeswalkers, and/or players. For each of them, exile the top card of your library, then Soulfire Eruption deals damage equal to that card's mana value to that permanent or player. You may play the exiled cards until the end of your next turn.";

export default defineCard({
  name: "Soulfire Eruption",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] }, orPlayer: "any" },
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    turnOrder: true,
    ownThisWay: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "impulse-exile", amount: 1, duration: "until-end-of-your-next-turn", play: true },
        {
          kind: "damage",
          target: 0,
          amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } },
        },
      ],
    },
  },
});
