import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 27434. Vizier of the True's shape: its own exert, and
// "whenever you exert a creature" — this one or any other you control (its
// ruling).

const EXERT_TEXT = "You may exert this creature as it attacks.";
const TRIGGER = "Whenever you exert a creature, creatures you control get +1/+0 until end of turn.";

export default defineCard({
  name: "Trueheart Twins",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Jackal", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${EXERT_TEXT} (It won't untap during your next untap step.)\n${TRIGGER}`,
  static: [{ affects: { scope: "self" }, exertAsItAttacks: {}, text: EXERT_TEXT }],
  triggered: [
    {
      trigger: { on: "exerted", who: "you-control" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
