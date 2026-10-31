import { defineCard } from "../define.js";

// "Attach it to another permanent it can enchant": chosen as this resolves,
// not targeted (rule 608.2c) — any permanent but the one it's on that it can
// legally enchant (`ontoChosen` with `another`, rule 303.4j). With none, it
// stays where it is, under your control.

const TEXT = "Gain control of target Aura that's attached to a permanent. Attach it to another permanent it can enchant.";

export default defineCard({
  name: "Aura Graft",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: {} } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      {
        kind: "attach",
        target: 0,
        attachment: 0,
        ontoChosen: { filter: {}, prompt: "Choose another permanent for the Aura to enchant", another: true },
      },
    ],
  },
});
