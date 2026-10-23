import { defineCard } from "../define.js";

// "If you control an artifact" is an intervening-if (rule 603.4): no trigger
// without one, no effect if there's none as it resolves (the rulings). The
// three-artifact check for first strike is made as it resolves.

const TEXT =
  "At the beginning of combat on your turn, if you control an artifact, this creature gets +2/+1 until end of turn. If you control three or more artifacts, it also gains first strike until end of turn.";

export default defineCard({
  name: "Toolcraft Exemplar",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 3 },
            then: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
