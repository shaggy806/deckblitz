import { defineCard } from "../define.js";

// EDHREC rank 24855.
//
// X counts every player's nonartifact creatures this destroyed, each read as it
// last existed on the battlefield; a regenerated or indestructible one wasn't.

export default defineCard({
  name: "Join the Collective",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Destroy all creatures. Create X 1/1 colorless Borg artifact creature tokens, where X is the number of " +
    "nonartifact creatures destroyed this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" } },
      {
        kind: "create-token",
        token: "Borg Token",
        count: { thisWay: "destroyed", filter: { notTypes: ["artifact"] } },
      },
    ],
  },
});
