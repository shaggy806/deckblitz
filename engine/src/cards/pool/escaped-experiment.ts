import { defineCard } from "../define.js";

// EDHREC rank 22190.

const ATTACK_TEXT =
  "Whenever this creature attacks, target creature an opponent controls gets -X/-0 until end of turn, where X is the number of artifacts you control.";

export default defineCard({
  name: "Escaped Experiment",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 2,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      // X is counted as the ability resolves.
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ countOf: { type: "artifact", controlledBy: "you" } }, -1] },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
