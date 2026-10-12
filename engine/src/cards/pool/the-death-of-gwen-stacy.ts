import { defineCard } from "../define.js";

// EDHREC rank 9300.

// Chapter II is a punisher asked of every player (`each-player-may`'s
// `options`: the discard is offered only to a player with a card to
// discard, so one with an empty hand doesn't, and loses 3). Chapter III is
// Stonespeaker Crystal's "any number of target players' graveyards".
const CHAPTER_I = "I — Destroy target creature.";
const CHAPTER_II = "II — Each player may discard a card. Each player who doesn't loses 3 life.";
const CHAPTER_III = "III — Exile any number of target players' graveyards.";

export default defineCard({
  name: "The Death of Gwen Stacy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "any-number", of: "player" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "exile-graveyard", target: 0 },
        simultaneous: true,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
