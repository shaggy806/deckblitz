import { defineCard } from "../define.js";

// EDHREC rank 7006.

const MANA_TEXT = "{T}: Add {G} or {W}. Activate only if this land entered this turn or if you control a basic land.";

// Dark Fortress's shape: Mirrex's "entered this turn" and the basic-land
// check, joined by "or" (not both-false).
export default defineCard({
  name: "Gathering Place",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      condition: {
        kind: "not",
        of: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "source", filter: { enteredThisTurn: true } } },
            { kind: "not", of: { kind: "controls", filter: { supertype: "basic", type: "land" }, atLeast: 1 } },
          ],
        },
      },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W"] }, amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
