import { defineCard } from "../define.js";

// EDHREC rank 11861.
//
// Ragost, Deft Gastronaut's shape: "Artifacts you control are Clues" is a
// layer-4 subtype grant over every artifact you control (Senator Peacock too,
// should it become one — the ruling), and the granted ability goes to exactly
// those artifacts; a Clue token keeps its own copy as well. "Whenever you
// sacrifice a Clue" fires for any sacrifice, not only a Clue's own ability
// (the ruling), once per Clue, matched as the Clue last existed.

const CLUES_TEXT =
  'Artifacts you control are Clues in addition to their other types and have "{2}, Sacrifice this artifact: Draw a card."';
const SAC_TEXT = "Whenever you sacrifice a Clue, target creature can't be blocked this turn.";

export default defineCard({
  name: "Senator Peacock",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 4,
  text: `${CLUES_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      addSubtypes: ["Clue"],
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "{2}, Sacrifice this artifact: Draw a card.",
        },
      ],
      text: CLUES_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
