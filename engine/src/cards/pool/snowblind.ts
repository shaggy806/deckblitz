import { defineCard } from "../define.js";

// One ability written as two statics, one for each "if": attacking, X counts
// the enchanted creature's defending player's snow lands
// (`forDefendingPlayer: "affected"`); otherwise its controller's
// (`fromAffectedController`). Y is the lesser of X and the creature's
// toughness minus 1 (`leavesToughness: 1`), read after every other P/T
// change, which it depends on (rule 613.8a).
const TEXT =
  "Enchanted creature gets -X/-Y. If that creature is attacking, X is the number of snow lands defending player controls. Otherwise, X is the number of snow lands its controller controls. Y is equal to X or to enchanted creature's toughness minus 1, whichever is smaller.";

export default defineCard({
  name: "Snowblind",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      text: TEXT,
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { attacking: true } } },
      grantPtPerCount: {
        filter: { type: "land", supertype: "snow", controlledBy: "you" },
        forDefendingPlayer: "affected",
        leavesToughness: 1,
        pt: [-1, -1],
      },
    },
    {
      text: TEXT,
      affects: { scope: "attached" },
      condition: { kind: "not", of: { kind: "source", filter: { attachedTo: { attacking: true } } } },
      grantPtPerCount: {
        filter: { type: "land", supertype: "snow", controlledBy: "you" },
        fromAffectedController: true,
        leavesToughness: 1,
        pt: [-1, -1],
      },
    },
  ],
});
