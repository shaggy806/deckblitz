import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 32152.

const BLACK_OR_GREEN: TargetSpec = {
  kind: "permanent",
  filter: { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["G"] }] },
};

export default defineCard({
  name: "Orcish Healer",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{R}{R}, {T}: Target creature can't be regenerated this turn.\n{B}{B}{R}, {T}: Regenerate target black or green creature.\n{R}{G}{G}, {T}: Regenerate target black or green creature.",
  activated: [
    {
      cost: { mana: "{R}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "cant-regenerate", target: 0 },
      resolve: null,
      text: "{R}{R}, {T}: Target creature can't be regenerated this turn.",
    },
    {
      cost: { mana: "{B}{B}{R}", tap: true },
      targets: [BLACK_OR_GREEN],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{B}{B}{R}, {T}: Regenerate target black or green creature.",
    },
    {
      cost: { mana: "{R}{G}{G}", tap: true },
      targets: [BLACK_OR_GREEN],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{R}{G}{G}, {T}: Regenerate target black or green creature.",
    },
  ],
});
