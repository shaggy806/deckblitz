import { defineCard } from "../define.js";

// EDHREC rank 17901.
const HASTE = "{1}: Target colorless creature gains haste until end of turn.";

export default defineCard({
  name: "Forerunner of Slaughter",
  manaCost: "{B}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 2,
  text: `Devoid (This card has no color.)\n${HASTE}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", colorless: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: HASTE,
    },
  ],
});
