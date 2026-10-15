import { defineCard } from "../define.js";

// EDHREC rank 19072.
//
// Scuzzback Scrounger's first-main-phase blight, with "if you don't" as the
// `may`'s `else`. Blighting isn't offered to a player who controls no
// creature (rule 701.68b — the ruling), so they lose the life.

const MAIN_TEXT = "At the beginning of your first main phase, you may blight 2. If you don't, you lose 3 life.";

export default defineCard({
  name: "Gutsplitter Gang",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 6,
  toughness: 6,
  text: `${MAIN_TEXT} (To blight 2, put two -1/-1 counters on a creature you control.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Blight 2? (If you don't, you lose 3 life.)",
        effect: { kind: "blight", amount: 2 },
        else: { kind: "lose-life", amount: 3 },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
