import { defineCard } from "../define.js";

// EDHREC rank 30735.
//
// The Gitrog Monster's `unless` shape, answered by you: without an Island to
// sacrifice you aren't asked. Otherwise it's sacrificed and deals 6 damage to
// you, as it last existed (rule 608.2h) if it's gone.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, unless you sacrifice an Island, sacrifice this creature and it deals 6 damage to you.";
const EVASION_TEXT = "This creature can't be blocked by red creatures.";

export default defineCard({
  name: "Elder Spawn",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spawn"],
  power: 6,
  toughness: 6,
  text: `${UPKEEP_TEXT}\n${EVASION_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { colors: ["R"] }, text: EVASION_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Island" }, text: "Sacrifice an Island" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-source" },
            { kind: "damage", amount: 6, who: "you" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
