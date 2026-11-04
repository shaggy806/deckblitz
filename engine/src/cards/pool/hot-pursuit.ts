import { defineCard } from "../define.js";

// If the enchantment has left as the first ability resolves, the target is
// suspected but not goaded at all (the ruling: `while-source` doesn't begin).
// The second: all creatures goaded, suspected or both, no choices (the ruling).
// They're untapped and given haste first, as Insurrection's are: a creature
// goaded only by a static with a "your opponents" filter stops being one of
// "them" as you gain control of it.
const ENTERS_TEXT =
  "When this enchantment enters, suspect target creature an opponent controls. As long as this enchantment remains on the battlefield, that creature is also goaded.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, if two or more players have lost the game, gain control of all goaded and/or suspected creatures until end of turn. Untap them. They gain haste until end of turn.";
const THEM = { type: "creature", anyOf: [{ goaded: true }, { suspected: true }] } as const;

export default defineCard({
  name: "Hot Pursuit",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "suspect", target: 0 },
          { kind: "goad", target: 0, duration: "while-source" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "players-lost", atLeast: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap-all", filter: THEM },
          { kind: "grant-keyword-all", filter: THEM, keyword: "haste", duration: "end-of-turn" },
          { kind: "gain-control-all", filter: THEM, untilEndOfTurn: true },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
