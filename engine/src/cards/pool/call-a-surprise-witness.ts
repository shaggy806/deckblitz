import { defineCard } from "../define.js";

// EDHREC rank 11327.
//
// In the order the card says: the creature returns, then gets its flying
// counter, then is a Spirit in addition to its other types for as long as
// it stays on the battlefield (no duration). The returned card keeps its id,
// so slot 0 still reaches it.
export default defineCard({
  name: "Call a Surprise Witness",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 3 or less from your graveyard to the battlefield. Put a flying counter on it. It's a Spirit in addition to its other types.",
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      { kind: "add-types", target: 0, addSubtypes: ["Spirit"], duration: "permanent" },
    ],
  },
});
