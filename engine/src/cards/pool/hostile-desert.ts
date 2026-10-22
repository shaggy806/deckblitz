import { defineCard } from "../define.js";

// EDHREC rank 9964.
//
// Rulings:
//   If Hostile Desert becomes a creature the same turn it enters the
//   battlefield, you can't attack with it or tap it for mana.

const ANIMATE =
  "{2}, Exile a land card from your graveyard: This land becomes a 3/4 Elemental creature until end of turn. It's still a land.";

export default defineCard({
  name: "Hostile Desert",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: `{T}: Add {C}.\n${ANIMATE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE,
    },
  ],
});
