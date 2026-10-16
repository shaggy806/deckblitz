import { defineCard } from "../define.js";

// EDHREC rank 11232.
//
// Disguise {2}{W} (rule 702.168). Turned face up it doesn't enter (708.8),
// but its own "when this creature is turned face up" triggers: every creature
// you control as it resolves gains hexproof until end of turn, and those same
// creatures untap.
const FACE_UP = "When this creature is turned face up, creatures you control gain hexproof until end of turn. Untap them.";

export default defineCard({
  name: "Essence of Antiquity",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 1,
  toughness: 10,
  text: `Disguise {2}{W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)\n${FACE_UP}`,
  morph: { keyword: "disguise", cost: "{2}{W}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "hexproof",
            duration: "end-of-turn",
          },
          { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
        ],
      },
      resolve: null,
      text: FACE_UP,
    },
  ],
});
