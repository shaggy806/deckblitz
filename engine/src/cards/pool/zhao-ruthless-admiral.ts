import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 14982. One trigger per permanent sacrificed (Korvold's
// `sacrifice` trigger); the creatures pumped are the ones you control as it
// resolves (rule 611.2c).
const FIREBENDING_TEXT =
  "Firebending 2 (Whenever this creature attacks, add {R}{R}. This mana lasts until end of combat.)";
const SACRIFICE_TEXT = "Whenever you sacrifice another permanent, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Zhao, Ruthless Admiral",
  manaCost: "{2}{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${FIREBENDING_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    firebending(2, FIREBENDING_TEXT),
    {
      trigger: { on: "sacrifice", who: "you", otherOnly: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
