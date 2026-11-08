import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 6839.

export default defineCard({
  name: "World War Hulk",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — The next red or green creature spell you cast this turn can be cast without paying its mana cost.\nII — Put three +1/+1 counters on target creature you control.\nIII — Choose target creature you control. Until end of turn, double its power and toughness and it gains trample.",
  // TODO(scaffold): I — The next red or green creature spell you cast this turn can be cast without paying its mana cost.
  // TODO(scaffold): II — Put three +1/+1 counters on target creature you control.
  // TODO(scaffold): III — Choose target creature you control. Until end of turn, double its power and toughness and it gains trample.
});
