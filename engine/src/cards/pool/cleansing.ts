import { defineCard } from "../define.js";

// EDHREC rank 22311.
//
// One question a land, each asked of every player in turn order from the
// active player (rule 101.4), the next only once the one before declines; the
// lands nobody paid for are destroyed together once the last has answered, as
// Killing Wave's are.
export default defineCard({
  name: "Cleansing",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "For each land, destroy that land unless any player pays 1 life.",
  effect: {
    kind: "for-each-unless",
    of: { permanents: { type: "land" } },
    asks: { anyOf: "each-player" },
    options: [{ payLife: 1, text: "Pay 1 life to keep {it}" }],
    otherwise: { kind: "destroy", target: 0, atRelease: true },
  },
});
