import { defineCard } from "../define.js";

// EDHREC rank 17900.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, up to one target creature gains first strike and vigilance until end of turn.";

export default defineCard({
  name: "Wild Pack Squad",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 3,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
