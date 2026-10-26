import { defineCard } from "../define.js";

// EDHREC rank 32022.

const TEXT = "{T}: This creature gets -2/+2 and loses flying until end of turn.";

export default defineCard({
  name: "Leering Gargoyle",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -2, toughness: 2, duration: "end-of-turn" },
          { kind: "lose-keywords", target: "source", keywords: ["flying"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
