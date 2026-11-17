import { defineCard } from "../define.js";

// "X target cards from target player's graveyard": a group of exactly X
// whose every member is a card in the player-slot's graveyard (`sameController:
// { slot: 0 }`). The life moves by the cards actually exiled, not by X (the
// ruling), as one life-gain event. A target player gone illegal loses no
// life, but the cards still legal are still exiled and the life still gained
// (the ruling; rule 608.2b).

export default defineCard({
  name: "Suffer the Past",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile X target cards from target player's graveyard. For each card exiled this way, that player loses 1 life and you gain 1 life.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, min: "x", max: "x", sameController: { slot: 0 } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 1, simultaneous: true, effect: { kind: "exile", target: 1 } },
      { kind: "lose-life", target: 0, amount: { thisWay: "exiled" } },
      { kind: "gain-life", amount: { thisWay: "exiled" } },
    ],
  },
});
