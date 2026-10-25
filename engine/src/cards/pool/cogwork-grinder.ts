import { defineCard } from "../define.js";

// Conspiracy (CNS). Its draft abilities do nothing here: no game on this engine is drafted,
// so no player has removed a card from the draft with a Cogwork Grinder. Its ruling: a player
// who removed none has X = 0, so it enters with no counters (and, a 0/0, dies to rule 704.5f).
export default defineCard({
  name: "Cogwork Grinder",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "Draft this card face up.\nAs you draft a card, you may remove it from the draft face down. (Those cards aren't in your card pool.)\nThis creature enters with X +1/+1 counters on it, where X is the number of cards you removed from the draft with cards named Cogwork Grinder.",
});
