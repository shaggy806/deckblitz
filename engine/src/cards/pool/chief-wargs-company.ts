import { defineCard } from "../define.js";

// EDHREC rank 15825.
//
// Rulings:
//   [2026-06-29] Once Chief Warg's Company has attacked, it will remain an attacking creature even
//     if you no longer control two or more other Wolves.
//
// "Can't attack unless" is Gadrak, the Crown-Scourge's restriction, asked as
// attackers are declared. A static's `controls` scan skips its own source, so
// "two or more other Wolves" is `atLeast: 2` without `countsSelf` — any
// permanent with the subtype, a kindred one too.

const ATTACK_TEXT = "This creature can't attack unless you control two or more other Wolves.";
const UPKEEP_TEXT = "At the beginning of your upkeep, create a 2/2 green Wolf creature token.";

export default defineCard({
  name: "Chief Warg's Company",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack"],
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Wolf" }, atLeast: 2 } },
      text: ATTACK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
