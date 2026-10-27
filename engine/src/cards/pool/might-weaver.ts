import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31799.

const TRAMPLE = "{2}: Target red or white creature gains trample until end of turn.";

export default defineCard({
  name: "Might Weaver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "{2}: Target red or white creature gains trample until end of turn. (It can deal excess combat damage to the player or planeswalker it's attacking.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["R"] }, { colors: ["W"] }] } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: TRAMPLE,
    },
  ],
});
