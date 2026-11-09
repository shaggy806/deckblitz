import { defineCard } from "../define.js";

// "Were attached" reads the creature as it last existed (rule 608.2h); the
// control change is indefinite (the card says so).
const THEM = { subtype: "Equipment", inSet: { attachmentsOf: 0 } } as const;

export default defineCard({
  name: "Murderous Spoils",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature. It can't be regenerated. You gain control of all Equipment that were attached to it. (This effect lasts indefinitely.)",
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      {
        kind: "for-each-permanent",
        filter: THEM,
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      },
    ],
  },
});
