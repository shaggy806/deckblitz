import { defineCard } from "../define.js";

// EDHREC rank 21253.
//
// The creature's owner (not its controller) chooses second from the top or
// the bottom; then up to one creature you control connives (Unstable
// Experiment's shape).

export default defineCard({
  name: "Trickster's Stratagem",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "The owner of target creature an opponent controls puts it into their library second from the top or on the bottom. Then up to one target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
  targets: ["creature-an-opponent-controls", { kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: [{ fromTop: 2 }, "bottom"] } },
      { kind: "connive", target: 1 },
    ],
  },
});
