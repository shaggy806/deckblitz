import { defineCard } from "../define.js";

// EDHREC rank 10603.
//
// Rulings:
//   [2023-10-13] When a player faces a villainous choice, they first choose one of the two
//     options, then all actions in the chosen option are performed.
//   [2023-10-13] A player facing a villainous choice can always choose either option, even if one
//     or both of the options are impossible. For example, if one of the options is to sacrifice a
//     creature, a player who controls no creatures can still choose that option.
//   [2023-10-13] If a spell or ability requires multiple players to face a villainous choice, the
//     result is a little different from other effects in Magic. In that case, the first player in
//     turn order makes their choice and the action for that choice is performed before the next
//     player makes their choice. Then each of the remaining players repeat this process in turn
//     order.
//
// A villainous choice (rule 701.56 — Dr. Eggman's `choices`), each opponent in
// turn. The first option is Dark Deal's for one player: the draw reads only
// what "that player" discarded this way (an empty hand draws nothing). The
// second is damage from this creature — as it last existed, if it has left —
// equal to that player's hand as the option is carried out.

const ENTER_TEXT =
  "Sanctified Rules of Combat — When this creature enters, each opponent faces a villainous choice — That opponent discards all the cards in their hand, then draws that many cards minus one, or this creature deals damage to that player equal to the number of cards in their hand.";

export default defineCard({
  name: "Sycorax Commander",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Alien", "Soldier"],
  power: 4,
  toughness: 2,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        choices: [
          {
            text: "That opponent discards all the cards in their hand, then draws that many cards minus one.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard-hand", who: "that-player" },
                {
                  kind: "draw",
                  who: "that-player",
                  amount: { difference: [{ thisWay: "discarded", who: "that-player" }, 1] },
                },
              ],
            },
          },
          {
            text: "This creature deals damage to that player equal to the number of cards in their hand.",
            effect: { kind: "damage", amount: { cardsInHand: "that-player" }, who: "that-player" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
