import { defineCard } from "../define.js";

// EDHREC rank 11936. All of them go on one creature that can take them all, not
// targeted, your opponent's if it's the only one; with none, none move (the
// rulings), and the Auras then fall off for want of a host (rule 704.5m).
const THEM = { inSet: { attachmentsOf: 0 } } as const;

export default defineCard({
  name: "Fumble",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. Gain control of all Auras and Equipment that were attached to it, then attach them to another creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "for-each-permanent",
        filter: THEM,
        as: 1,
        effect: { kind: "gain-control", target: 1, untilEndOfTurn: false },
      },
      {
        kind: "attach",
        attachment: { all: THEM },
        target: { among: { type: "creature" }, prompt: "Choose another creature to attach them to" },
      },
    ],
  },
});
