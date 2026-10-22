import { defineCard } from "../define.js";

// EDHREC rank 25232. Any Vampire, whoever controls it; the target is chosen as
// the trigger goes on the stack and the "you may" asked as it resolves.

const TEXT = "At the beginning of combat on your turn, you may have target Vampire get +2/+0 until end of turn.";

export default defineCard({
  name: "Anointed Deacon",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", filter: { subtype: "Vampire" } }],
      effect: {
        kind: "may",
        prompt: "Have the target Vampire get +2/+0 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
