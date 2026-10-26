import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). X is read as the ability resolves, so it
// counts the land returned for the cost (the ruling); the errata makes the
// -X/-0 last until end of turn.
const TEXT =
  "{2}, Return a land you control to its owner's hand: Target creature gets -X/-0 until end of turn, where X is the number of cards in your hand.";

export default defineCard({
  name: "Oboro Envoy",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ cardsInHand: "you" }, -1] },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
