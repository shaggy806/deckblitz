import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 31725.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Nothing was exiled with it before the game, so the ability makes no token, and X —
// "the mana value of that card" — is undefined, so 0 (rule 107.2): {0}, {T} for nothing.
export default defineCard({
  name: "Caller of the Untamed",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 4,
  text: "Before you shuffle your deck to start the game, you may reveal this card from your deck and exile a creature card you drafted that isn't in your deck.\n{X}, {T}: Create a token that's a copy of a card you exiled with cards named Caller of the Untamed. X is the mana value of that card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "sequence", effects: [] },
      resolve: null,
      text: "{X}, {T}: Create a token that's a copy of a card you exiled with cards named Caller of the Untamed. X is the mana value of that card.",
    },
  ],
});
