import { defineCard } from "../define.js";

// "By creatures your opponents control" is asked as each damage would be
// dealt (rule 615.1), so a creature arriving later is covered too.
export default defineCard({
  name: "Obscuring Haze",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "If you control a commander, you may cast this spell without paying its mana cost.\nPrevent all damage that would be dealt this turn by creatures your opponents control.",
  freeCastIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 } },
  targets: [],
  effect: { kind: "damage-rule", by: { filter: { type: "creature", controlledBy: "opponent" } } },
});
