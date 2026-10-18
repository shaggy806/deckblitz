import { defineCard } from "../define.js";

// EDHREC rank 21367.
//
// The creature's owner picks top or bottom; then you create a Mutagen. An
// illegal target means the spell doesn't resolve and no Mutagen is made (the
// ruling — its only target).

export default defineCard({
  name: "Return to the Sewers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature's owner puts it on their choice of the top or bottom of their library. You create a Mutagen token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      { kind: "create-token", token: "Mutagen Token", count: 1 },
    ],
  },
});
