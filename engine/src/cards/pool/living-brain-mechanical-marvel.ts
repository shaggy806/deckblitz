import { defineCard } from "../define.js";

// EDHREC rank 16088.
//
// Not "another": Living Brain may target itself. A layer-7b base P/T set
// with its own timestamp, as Synthesizer Labship's.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target non-Equipment artifact you control becomes an artifact creature with base power and toughness 3/3 until end of turn. Untap it.";

export default defineCard({
  name: "Living Brain, Mechanical Marvel",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Villain"],
  power: 3,
  toughness: 3,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "artifact", notSubtypes: ["Equipment"] } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: 0,
            power: 3,
            toughness: 3,
            addTypes: ["artifact", "creature"],
            addSubtypes: [],
            keywords: [],
            duration: "end-of-turn",
          },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
