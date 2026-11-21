import { defineCard } from "../define.js";

// EDHREC rank 22503.
//
// Flood the Engine's shape: an enters trigger that taps the enchanted creature and
// unprepares it (rule 722.3b — `become-unprepared` on `"attached"`; its prepared copy
// in exile goes with the next state-based check, 704.5e), and a `loseAllAbilities`
// static whose own "doesn't untap" stays (rule 613.7).

const ENTER_TEXT = "When this Aura enters, tap enchanted creature. It becomes unprepared.";
const LOCK_TEXT = "Enchanted creature loses all abilities and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Infinite Coursework",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${LOCK_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "become-unprepared", target: "attached" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      restrictions: ["doesnt-untap"],
      text: LOCK_TEXT,
    },
  ],
});
