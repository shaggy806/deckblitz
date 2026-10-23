import { defineCard } from "../define.js";

// EDHREC rank 29772.

const TEXT = "{3}{W}: Target Human gains double strike until end of turn.";

export default defineCard({
  name: "Veteran Cathar",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Human" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
