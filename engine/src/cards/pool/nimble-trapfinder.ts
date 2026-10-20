import { defineCard } from "../define.js";

// Rulings: the first ability asks what entered as it entered (a turn-history
// `entered` entry is matched as it entered), whether or not it's still under
// your control; the second gives the trigger only to creatures you control as
// it resolves, and they keep it for the turn.

const SNEAKY =
  "This creature can't be blocked if you had another Cleric, Rogue, Warrior, or Wizard enter the battlefield under your control this turn.";
const DRAW = "Whenever this creature deals combat damage to a player, draw a card.";
const COMBAT = `At the beginning of combat on your turn, if you have a full party, creatures you control gain "${DRAW}" until end of turn.`;

export default defineCard({
  name: "Nimble Trapfinder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  text: `${SNEAKY}\n${COMBAT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "turn-history",
        what: "entered",
        filter: { subtypes: ["Cleric", "Rogue", "Warrior", "Wizard"] },
        excludeSelf: true,
      },
      grantKeywords: ["unblockable"],
      text: SNEAKY,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "full-party" },
      targets: [],
      effect: {
        kind: "grant-triggered-all",
        filter: { type: "creature", controlledBy: "you" },
        ability: {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: DRAW,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
