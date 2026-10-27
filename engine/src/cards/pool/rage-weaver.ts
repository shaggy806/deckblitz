import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31867.
export default defineCard({
  name: "Rage Weaver",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "{2}: Target black or green creature gains haste until end of turn. (It can attack and {T} this turn.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["G"] }] } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target black or green creature gains haste until end of turn.",
    },
  ],
});
