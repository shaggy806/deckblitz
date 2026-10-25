import { defineCard } from "../define.js";

// EDHREC rank 7256. Any creature may be the target — the black creature that
// entered, or the Denizen itself (the rulings).
const TEXT =
  "Whenever another black creature you control enters, target creature gains intimidate until end of turn. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)";

export default defineCard({
  name: "Shadow Alley Denizen",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", colors: ["B"] },
      },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "intimidate", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
