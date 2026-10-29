import { defineCard } from "../define.js";

// EDHREC rank 187.
// Both modes once you control any commander as you cast it — whoever's it is, and whatever happens
// to it after (the rulings). Each mode reaches only the creatures you control as it resolves.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Akroma's Will",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Creatures you control gain flying, vigilance, and double strike until end of turn.\n• Creatures you control gain lifelink, indestructible, and protection from each color until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: "Creatures you control gain flying, vigilance, and double strike until end of turn.",
        targets: [],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "grant-keyword-all", filter: YOURS, keyword: "flying", duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: YOURS, keyword: "double-strike", duration: "end-of-turn" },
          ],
        },
      },
      {
        text: "Creatures you control gain lifelink, indestructible, and protection from each color until end of turn.",
        targets: [],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "grant-keyword-all", filter: YOURS, keyword: "lifelink", duration: "end-of-turn" },
            { kind: "grant-keyword-all", filter: YOURS, keyword: "indestructible", duration: "end-of-turn" },
            {
              kind: "grant-protection",
              filter: YOURS,
              from: { colors: ["W", "U", "B", "R", "G"] },
              duration: "end-of-turn",
            },
          ],
        },
      },
    ],
  },
});
