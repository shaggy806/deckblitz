import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 32220.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Its ruling: unless you drafted a Lurking Automaton the highest number you noted is 0, so
// it enters with no counters — a 0/0 that dies to state-based actions.
export default defineCard({
  name: "Lurking Automaton",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "Reveal this card as you draft it and note how many cards you've drafted this draft round, including this card.\nThis creature enters with X +1/+1 counters on it, where X is the highest number you noted for cards named Lurking Automaton.",
});
