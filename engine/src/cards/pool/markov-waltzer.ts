import { defineCard } from "../define.js";

// EDHREC rank 19439. Zimone, Paradox Sculptor's "each of up to two target
// creatures you control".

const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to two target creatures you control each get +1/+0 until end of turn.";

export default defineCard({
  name: "Markov Waltzer",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "any-number", of: "creature-you-control", max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
