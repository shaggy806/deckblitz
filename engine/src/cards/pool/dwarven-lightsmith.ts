import { defineCard } from "../define.js";

const TEXT = "When this creature enters, creatures your team controls get +1/+1 until end of turn.";

// Outside Two-Headed Giant your team is you alone (rule 810.1 — Sickle Dancer
// reads "your team controls" as you control).
export default defineCard({
  name: "Dwarven Lightsmith",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 3,
  toughness: 4,
  assist: true,
  text: `Assist (Another player can pay up to {5} of this spell's cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
