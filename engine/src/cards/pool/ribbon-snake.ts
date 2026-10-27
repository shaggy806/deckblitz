import { defineCard } from "../define.js";

// EDHREC rank 31397. "Any player may activate this ability" is `anyPlayer`
// (rule 602.2): an opponent pays the {2} to take its flying away.

const TEXT = "{2}: This creature loses flying until end of turn. Any player may activate this ability.";

export default defineCard({
  name: "Ribbon Snake",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      anyPlayer: true,
      text: TEXT,
    },
  ],
});
