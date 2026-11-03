import { defineCard } from "../define.js";

// Ikoria: Lair of Behemoths (IKO). EDHREC rank 12557.
//
// The defending player chooses among their own creatures blocking the one
// that became blocked, as the trigger resolves.
const BLOCKED_TEXT =
  "Whenever a creature you control with menace becomes blocked, defending player sacrifices a creature of their choice that's blocking it.";
const PUMP_TEXT = "{B}{R}: Creatures you control with menace get +1/+0 until end of turn.";

export default defineCard({
  name: "Labyrinth Raptor",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Dinosaur"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${BLOCKED_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature", keyword: "menace" } },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "trigger-player",
        filter: { type: "creature", blockingRelation: { relation: "blocking", of: "trigger-object" } },
        count: 1,
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you", keyword: "menace" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
