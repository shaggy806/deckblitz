import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 16001.
//
// Each player, from the active player in turn order, may draw: if they do,
// they choose two cards or one (a `modal` inside the `each-player-may`'s
// `effect`, which is that player's own effect — "you" in it is them). The
// life reads `thisWay: "drawn"`, so a draw that didn't happen (an empty
// library, a draw replaced) counts as a card less, as the card says. A player
// who declines to draw gains 4 (`ifDidnt`, about "that-player").

const TEXT =
  "Each player may draw up to two cards. For each card less than two a player draws this way, that player gains 2 life.";

const GAIN = {
  kind: "gain-life",
  amount: { product: [2, { difference: [2, { thisWay: "drawn", who: "you" }] }] },
} as const;

export default defineCard({
  name: "Truce",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
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
