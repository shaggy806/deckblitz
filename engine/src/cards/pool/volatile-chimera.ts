import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 31908.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Nothing was exiled with it before the game, so there's no card to choose and it
// becomes a copy of nothing: the ability resolves doing nothing.
export default defineCard({
  name: "Volatile Chimera",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Chimera"],
  power: 3,
  toughness: 2,
  text: "Before you shuffle your deck to start the game, you may reveal this card from your deck and exile three or more creature cards you drafted that aren't in your deck.\n{1}{R}: Choose a card at random you exiled with cards named Volatile Chimera. This creature becomes a copy of that card, except it has this ability.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "sequence", effects: [] },
      resolve: null,
      text: "{1}{R}: Choose a card at random you exiled with cards named Volatile Chimera. This creature becomes a copy of that card, except it has this ability.",
    },
  ],
});
