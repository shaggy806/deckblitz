import { defineCard } from "../define.js";

// EDHREC rank 6859.
//
// Rulings:
//   [2008-10-01] The set of creatures affected is fixed as Titanic Ultimatum resolves.
//   [2008-10-01] Multiple instances of first strike and trample are redundant.
const ALL = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Titanic Ultimatum",
  manaCost: "{R}{R}{G}{G}{G}{W}{W}",
  colors: ["W", "R", "G"],
  types: ["sorcery"],
  text: "Until end of turn, creatures you control get +5/+5 and gain first strike, trample, and lifelink.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: ALL, power: 5, toughness: 5, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: ALL, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: ALL, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: ALL, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
