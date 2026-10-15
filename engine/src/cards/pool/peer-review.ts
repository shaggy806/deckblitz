import { defineCard } from "../define.js";

// The prepare spell of Semester Foreseer and Fatehold Chronologist (rule 722):
// no card of its own, only ever cast as the copy a prepared one makes in
// exile (722.3c).
export default defineCard({
  name: "Peer Review",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Create a 2/2 colorless Wizard Soldier creature token named Cadet. Surveil 1.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Cadet", count: 1 },
      { kind: "surveil", amount: 1 },
    ],
  },
});
