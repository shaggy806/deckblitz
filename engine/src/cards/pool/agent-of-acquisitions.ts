import { defineCard } from "../define.js";

// Conspiracy (CNS). Its draft abilities do nothing here: no game on this engine is drafted,
// so it is a 2/1 artifact creature with no ability that works in a game.
export default defineCard({
  name: "Agent of Acquisitions",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: "Draft this card face up.\nInstead of drafting a card from a booster pack, you may draft each card in that booster pack, one at a time. If you do, turn this card face down and you can't draft cards for the rest of this draft round. (You may look at booster packs passed to you.)",
});
