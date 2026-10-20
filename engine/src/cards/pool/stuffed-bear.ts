import { defineCard } from "../define.js";

const ANIMATE_TEXT = "{2}: This artifact becomes a 4/4 green Bear artifact creature until end of turn.";

export default defineCard({
  name: "Stuffed Bear",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: ANIMATE_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      // Levitating Statue's shape, green.
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        setSubtypes: ["Bear"],
        setColors: ["G"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
