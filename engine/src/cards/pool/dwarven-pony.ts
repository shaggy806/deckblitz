import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 26390.

const TEXT = "{1}{R}, {T}: Target Dwarf creature gains mountainwalk until end of turn.";

export default defineCard({
  name: "Dwarven Pony",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 1,
  toughness: 1,
  text: "{1}{R}, {T}: Target Dwarf creature gains mountainwalk until end of turn. (It can't be blocked as long as defending player controls a Mountain.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Dwarf" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "mountainwalk", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
