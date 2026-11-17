import { defineCard } from "../define.js";

// The targets are exiled together; the opponent you choose as it resolves
// (its ruling) separates them in exile (rule 700.3), and you choose the pile
// that comes onto the battlefield under your control. The rest go to their
// owners' graveyards.

const TEXT =
  "Exile up to five target creature cards from graveyards. An opponent separates those cards into two piles. Put all cards from the pile of your choice onto the battlefield under your control and the rest into their owners' graveyards.";

export default defineCard({
  name: "Boneyard Parley",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }, max: 5 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      {
        kind: "separate-into-piles",
        objects: { thisWay: "exiled" },
        separator: "an-opponent",
        chooser: "you",
        chosen: "battlefield",
        rest: "graveyard",
      },
    ],
  },
});
