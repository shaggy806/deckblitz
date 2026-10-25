import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 23071.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// drafted face up or passed to its drafter. Its in-play ability works as printed.
export default defineCard({
  name: "Canal Dredger",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 5,
  text: "Draft this card face up.\nEach player passes the last card from each booster pack to a player who drafted a card named Canal Dredger.\n{T}: Put target card from your graveyard on the bottom of your library.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{T}: Put target card from your graveyard on the bottom of your library.",
    },
  ],
});
