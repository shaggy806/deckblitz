import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 30713.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Nothing was exiled with it before the game, so its enters trigger copies nothing —
// the trigger still goes on the stack and resolves doing nothing.
export default defineCard({
  name: "Arcane Savant",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: "Before you shuffle your deck to start the game, you may reveal this card from your deck and exile an instant or sorcery card you drafted that isn't in your deck.\nWhen this creature enters, copy a card you exiled with cards named Arcane Savant. You may cast the copy without paying its mana cost.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [] },
      resolve: null,
      text: "When this creature enters, copy a card you exiled with cards named Arcane Savant. You may cast the copy without paying its mana cost.",
    },
  ],
});
