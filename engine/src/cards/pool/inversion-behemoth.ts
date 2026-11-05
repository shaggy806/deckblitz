import { defineCard } from "../define.js";

const TEXT = "At the beginning of combat on your turn, switch the power and toughness of each of any number of target creatures until end of turn.";

export default defineCard({
  name: "Inversion Behemoth",
  manaCost: "{2}{C}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 2,
  toughness: 9,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "any-number", of: "creature" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
