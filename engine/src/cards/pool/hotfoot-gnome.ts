import { defineCard } from "../define.js";

// EDHREC rank 19559.

export default defineCard({
  name: "Hotfoot Gnome",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{T}: Another target creature gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Another target creature gains haste until end of turn.",
    },
  ],
});
