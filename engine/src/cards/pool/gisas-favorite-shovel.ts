import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10637. "If they do" reads the sacrifice this resolution made.

const STATIC_TEXT = "Equipped creature gets +2/+0 and has menace.";
const ATTACK_TEXT =
  "Whenever equipped creature attacks, defending player sacrifices a creature of their choice. If they do, you create a Walker token.";

export default defineCard({
  name: "Gisa's Favorite Shovel",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\n${ATTACK_TEXT}\nEquip {4}`,
  activated: [equip("{4}")],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: { kind: "create-token", token: "Walker Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], grantKeywords: ["menace"], text: STATIC_TEXT }],
});
