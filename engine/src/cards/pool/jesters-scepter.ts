import { defineCard } from "../define.js";

// EDHREC rank 23119. Coldsnap. The five cards go into exile face down and
// linked (rule 607.2a), their exiler alone may look at them (406.3,
// `faceDown: "looked"`), so the cost picks the one it wants rather than one
// at random. The cost remembers the card it put into its owner's graveyard
// (`{ paid: "put-from-exile" }`), and the counter happens only if the target
// has that card's name (rule 201.2a: a split card shares either half's —
// the Hit/Run ruling). Any spell may be targeted whatever its name (ruling).
const ETB_TEXT =
  "When this artifact enters, exile the top five cards of target player's library face down. You may look at those cards for as long as they remain exiled.";
const COUNTER_TEXT =
  "{2}, {T}, Put a card exiled with this artifact into its owner's graveyard: Counter target spell if it has the same name as that card.";

export default defineCard({
  name: "Jester's Scepter",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ETB_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "exile-from-library", whose: 0, amount: 5, faceDown: "looked", linked: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, putFromExile: { count: 1, linked: true } },
      targets: ["spell"],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { sameNameWith: { paid: "put-from-exile" } } },
        then: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
