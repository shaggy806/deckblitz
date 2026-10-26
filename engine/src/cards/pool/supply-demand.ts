import { defineCard } from "../define.js";

// Dissension. EDHREC rank 20287. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both halves' colours.
// Never cast itself; a spell is one half or the other (supply.ts, demand.ts).
const FACES = ["Supply // Demand", "Supply", "Demand"];
const SUPPLY_TEXT = "Create X 1/1 green Saproling creature tokens.";
const DEMAND_TEXT = "Search your library for a multicolored card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Supply // Demand",
  manaCost: "{X}{G}{W}{1}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["sorcery"],
  text: `${SUPPLY_TEXT}\n//\n${DEMAND_TEXT}`,
  faces: FACES,
  split: true,
});
