import { defineCard } from "../define.js";

// EDHREC rank 10977. Imperial Edict's choice as it resolves: with no creature
// to choose, they simply exile their graveyard (the ruling).

export default defineCard({
  name: "Strategic Betrayal",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent exiles a creature they control and their graveyard.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: { target: 0 },
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
      },
      { kind: "for-each-voted", which: "voted", effect: { kind: "exile", target: 0 } },
      { kind: "exile-graveyard", target: 0 },
    ],
  },
});
