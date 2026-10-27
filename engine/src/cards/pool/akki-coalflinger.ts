import { defineCard } from "../define.js";

// EDHREC rank 20167.

const TEXT = "{R}, {T}: Attacking creatures gain first strike until end of turn.";

export default defineCard({
  name: "Akki Coalflinger",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
