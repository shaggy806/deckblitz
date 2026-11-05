import { defineCard } from "../define.js";

// EDHREC rank 15528.

export default defineCard({
  name: "Gearshift Ace",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nWhenever this creature crews a Vehicle, that Vehicle gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "crews-or-saddles", who: "self", as: ["crew"] },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "trigger-object",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature crews a Vehicle, that Vehicle gains first strike until end of turn.",
    },
  ],
});
