import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32237.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Its ruling: with none drafted the highest noted number is 0, so it enters with no
// counters and, a 0/0, dies to state-based actions.
export default defineCard({
  name: "Pyretic Hunter",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Cat"],
  power: 0,
  toughness: 0,
  keywords: ["menace"],
  text: "Reveal this card as you draft it and note how many cards you've drafted this draft round, including this card.\nMenace (This creature can't be blocked except by two or more creatures.)\nThis creature enters with X +1/+1 counters on it, where X is the highest number you noted for cards named Pyretic Hunter.",
});
