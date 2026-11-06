import { defineCard } from "../define.js";

// EDHREC rank 23667.
//
// "Whenever a creature blocks this creature" fires once per blocker, the
// blocker as the trigger object — flanking's `blocked-by` shape.

const BLOCK_TEXT = "Whenever a creature blocks this creature, that creature gets -1/-1 until end of turn.";
const GRANT_TEXT = `Artifact creatures you control have menace and "${BLOCK_TEXT}"`;

export default defineCard({
  name: "Extraction Integrant",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 1,
  text: GRANT_TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["menace"],
      grantsTriggered: [
        {
          trigger: { on: "blocked-by", who: "self", blocker: { type: "creature" } },
          targets: [],
          effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
          resolve: null,
          text: BLOCK_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
