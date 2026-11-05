import { defineCard } from "../define.js";

// EDHREC rank 15273. Chosen as the ability resolves, not targeted; one creature
// is a valid set (the rulings). X is this creature's power then.
const TEXT =
  "At the beginning of combat on your turn, choose any number of creatures with different powers. Each of them gets +X/+X and gains vigilance until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Sigardian Zealot",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature" },
        upTo: 99,
        together: { distinctPowers: true },
        prompt: "Choose any number of creatures with different powers to get +X/+X and vigilance",
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt",
              target: 0,
              power: { powerOf: "source" },
              toughness: { powerOf: "source" },
              duration: "end-of-turn",
            },
            { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
