import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 30852.
const TEXT =
  "{U}{U}, {T}: Target creature gains shroud until end of turn. Activate only during your upkeep. (It can't be the target of spells or abilities.)";

export default defineCard({
  name: "Svyelunite Priest",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: TEXT,
    },
  ],
});
