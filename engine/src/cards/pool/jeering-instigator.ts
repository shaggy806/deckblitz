import { defineCard } from "../define.js";

// EDHREC rank 16374. Khans of Tarkir.
//
// "If it's your turn" is an intervening if (rule 603.4): checked as it
// triggers and again as it resolves.

const FACE_UP_TEXT =
  "When this creature is turned face up, if it's your turn, gain control of another target creature until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Jeering Instigator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{R}" },
  text: `Morph {2}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      condition: { kind: "your-turn" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
