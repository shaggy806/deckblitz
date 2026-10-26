import { defineCard } from "../define.js";

const TEXT = "{5}: Until end of turn, this artifact becomes an 8/8 Golem artifact creature with trample.";

export default defineCard({
  name: "Xanthic Statue",
  manaCost: "{8}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 8,
        toughness: 8,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Golem"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
