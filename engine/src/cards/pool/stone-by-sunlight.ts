import { defineCard } from "../define.js";

// EDHREC rank 15599.

export default defineCard({
  name: "Stone by Sunlight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with power 4 or greater.\n• Until end of turn, target creature becomes an artifact in addition to its other types and gains indestructible. (Damage and effects that say \"destroy\" don't destroy it.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Until end of turn, target creature becomes an artifact in addition to its other types and gains indestructible.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-types", target: 0, addTypes: ["artifact"], duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
