import { defineCard } from "../define.js";

// EDHREC rank 7482. A daybound werewolf (Infestation Expert's shape); the back
// face is Hollowhenge Huntmaster.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, put two +1/+1 counters on another target creature you control.";

export default defineCard({
  name: "Avabruck Caretaker",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["hexproof", "daybound"],
  text: `Hexproof\n${COMBAT_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  faces: ["Avabruck Caretaker", "Hollowhenge Huntmaster"],
  transform: true,
});
