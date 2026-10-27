import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 22027.

const ANIMATE_TEXT = "{G}, Sacrifice this artifact: Until end of turn, target land becomes a 3/3 creature that's still a land.";

export default defineCard({
  name: "Lifespark Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${ANIMATE_TEXT}\n{1}, Sacrifice this artifact: Draw a card.`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "self" },
      targets: ["land"],
      effect: {
        kind: "animate",
        target: 0,
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Draw a card.",
    },
  ],
});
