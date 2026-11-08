import { defineCard } from "../define.js";

export default defineCard({
  name: "Hex Magic",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Exile all the cards from your hand, then draw that many cards. Until the end of your next turn, you may play cards exiled this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "you", fromHand: "only" },
      { kind: "draw", amount: { thisWay: "exiled-from-hand" } },
      { kind: "grant-play", cards: { thisWay: "exiled-from-hand" }, duration: "until-end-of-your-next-turn", play: true },
    ],
  },
});
