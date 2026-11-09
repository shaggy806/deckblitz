import { defineCard } from "../define.js";

const ENTER_TEXT = "When this Siege enters, exile all cards from your hand, then draw that many cards. Until the end of your next turn, you may play cards exiled this way.";

export default defineCard({
  name: "Invasion of Kaldheim",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
        ],
      },
      resolve: null,
      text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "you", fromHand: "only" },
          { kind: "draw", amount: { thisWay: "exiled-from-hand" } },
          { kind: "grant-play", cards: { thisWay: "exiled-from-hand" }, duration: "until-end-of-your-next-turn", play: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Kaldheim", "Pyre of the World Tree"],
  transform: true,
});
