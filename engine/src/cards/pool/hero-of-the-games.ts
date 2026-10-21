import { defineCard } from "../define.js";

// Heroic. Only the creatures you control as it resolves get the bonus (its
// ruling) — `modify-pt-all` reads the battlefield then.

const TRIGGER_TEXT =
  "Whenever you cast a spell that targets this creature, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Hero of the Games",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
