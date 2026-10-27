import { defineCard } from "../define.js";

const ANIMATE_TEXT =
  "Threshold — {G}{W}: This land becomes a 4/4 green and white Insect Monk creature with first strike until end of turn. It's still a land. Activate only if there are seven or more cards in your graveyard.";

// Ruling: once activated, it stays a creature this turn even if the graveyard
// drops below seven — the condition gates activation only.
export default defineCard({
  name: "Nantuko Monastery",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${ANIMATE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{G}{W}", tap: false },
      condition: { kind: "threshold" },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Insect", "Monk"],
        setColors: ["G", "W"],
        keywords: ["first-strike"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
