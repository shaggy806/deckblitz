import { defineCard } from "../define.js";

// EDHREC rank 18791. Truce's text and shape, as a sorcery.

const TEXT =
  "Each player may draw up to two cards. For each card less than two a player draws this way, that player gains 2 life.";

const GAIN = {
  kind: "gain-life",
  amount: { product: [2, { difference: [2, { thisWay: "drawn", who: "you" }] }] },
} as const;

export default defineCard({
  name: "Temporary Truce",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Draw up to two cards? (2 life for each card less than two)",
    effect: {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        { text: "Draw two cards.", effect: { kind: "sequence", effects: [{ kind: "draw", amount: 2 }, GAIN] } },
        {
          text: "Draw one card and gain 2 life.",
          effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, GAIN] },
        },
      ],
    },
    ifDidnt: { kind: "gain-life", who: "that-player", amount: 4 },
  },
});
