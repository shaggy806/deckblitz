import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, target Elf you control gains trample and gets +X/+X until end of turn, where X is the number of Forests you control.";
const FORESTS = { countOf: { subtype: "Forest", controlledBy: "you" } } as const;

// Ruling: X is counted as the ability resolves.
export default defineCard({
  name: "Mirkwood Channeler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Elf" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: FORESTS, toughness: FORESTS, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
