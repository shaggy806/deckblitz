import { defineCard } from "../define.js";

// EDHREC rank 14942.
//
// "Until this creature leaves the battlefield" (rule 610.3): the exile is
// linked to the source, and its leaving returns the card. If it has already
// left as the trigger resolves, nothing is exiled (the ruling).
//
// Rulings:
//   [2023-04-14] If Alabaster Host Intercessor leaves the battlefield before its
//     enters-the-battlefield ability resolves, the target creature won't be exiled at all.

const ENTER_TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Alabaster Host Intercessor",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Samurai"],
  power: 3,
  toughness: 4,
  cycling: { cost: "{2}", search: { subtype: "Plains" } },
  text: `${ENTER_TEXT}\nPlainscycling {2} ({2}, Discard this card: Search your library for a Plains card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
