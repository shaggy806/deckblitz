import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 32057. Kjeldoran Elite Guard's shape: the
// delayed trigger watches the target's stint and sacrifices the Wolf.

const TEXT =
  "{T}: Target Dwarf creature gets +2/+0 and gains first strike until end of turn. When that creature leaves the battlefield this turn, sacrifice this creature. Activate only during combat.";

export default defineCard({
  name: "Heart Wolf",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Dwarf" } }],
      condition: { kind: "turn-structure", duringCombat: true },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard", "exile", "hand", "library", "command"], thisTurn: true },
            effect: { kind: "sacrifice-source" },
            text: "When that creature leaves the battlefield this turn, sacrifice Heart Wolf.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
