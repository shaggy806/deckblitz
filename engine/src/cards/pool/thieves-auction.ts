import { defineCard } from "../define.js";

// EDHREC rank 9814.
//
// Rulings:
//   An Aura put onto the battlefield this way does not target the permanent it is placed upon.
//   Triggers from the permanents leaving the battlefield and then being put back onto the
//     battlefield are not put on the stack until the entire effect is done.
//   In multi-player games, it affects all players and players make choices in turn order.
//   You can't pick a card that can't legally be returned to the battlefield. If there are no cards
//     that can be legally returned, then you can't pick one.
//   If you choose an Aura, you can put it on any permanent it can legally enchant. If there is
//     nothing it can legally enchant, it remains exiled, and it can still be chosen by you or
//     another player later in the auction. If there comes a point where only Auras and no legal
//     permanents left, they stay exiled permanently.
//
// The exile is one event; then `take-turns-choosing` over the cards it exiled, starting with you.

const TEXT =
  "Exile all nontoken permanents. Starting with you, each player chooses one of the exiled cards and puts it onto the battlefield tapped under their control. Repeat this process until all cards exiled this way have been chosen.";

export default defineCard({
  name: "Thieves' Auction",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-all", filter: { token: false } },
      { kind: "take-turns-choosing", pile: "exiled-this-way", destination: "battlefield", enterTapped: true },
    ],
  },
});
