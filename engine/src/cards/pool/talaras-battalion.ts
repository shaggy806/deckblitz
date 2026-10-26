import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 21058.
//
// Checked as it's cast, before this spell is one of the turn's spells, so one
// green spell cast earlier is "another" (Hewed Stone Retainers' shape).

export default defineCard({
  name: "Talara's Battalion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: "Cast this spell only if you've cast another green spell this turn.\nTrample",
  castOnlyIf: { kind: "cast-this-turn", who: "you", filter: { colors: ["G"] }, atLeast: 1 },
});
