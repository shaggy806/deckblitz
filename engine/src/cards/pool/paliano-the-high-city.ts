import { defineCard } from "../define.js";

// Conspiracy (CNS). Its draft ability does nothing here: no game on this engine is drafted,
// so no colours were chosen as anyone drafted a Paliano. Its ruling: a player who didn't
// draft one gets no mana from its mana ability — not even colourless. So the ability names
// no mana type, and makes none (rule 106.5), as Regicide's target names no colour.
export default defineCard({
  name: "Paliano, the High City",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: "Reveal this card as you draft it. The player to your right chooses a color, you choose another color, then the player to your left chooses a third color.\n{T}: Add one mana of any color chosen as you drafted cards named Paliano, the High City.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: [] }, amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color chosen as you drafted cards named Paliano, the High City.",
    },
  ],
});
