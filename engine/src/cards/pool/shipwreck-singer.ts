import { defineCard } from "../define.js";

// EDHREC rank 26742.
//
// The -1/-1 is locked in on the creatures attacking as it resolves (rule
// 611.2c): activating it before combat affects nothing that attacks later
// (the ruling).

const LURE_TEXT = "{1}{U}: Target creature an opponent controls attacks this turn if able.";
const SHRINK_TEXT = "{1}{B}, {T}: Attacking creatures get -1/-1 until end of turn.";

export default defineCard({
  name: "Shipwreck Singer",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${LURE_TEXT}\n${SHRINK_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      resolve: null,
      text: LURE_TEXT,
    },
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: SHRINK_TEXT,
    },
  ],
});
