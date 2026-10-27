import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 32179. Archway Commons' "sacrifice it
// unless you pay", the amount Esper Sentinel's `payGeneric` — the cards in
// your hand counted as the trigger resolves.

const TEXT = "When this creature enters, sacrifice it unless you pay {1} for each card in your hand.";

export default defineCard({
  name: "Megatherium",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ payGeneric: { cardsInHand: "you" }, text: "Pay {X} ({1} for each card in your hand)." }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
