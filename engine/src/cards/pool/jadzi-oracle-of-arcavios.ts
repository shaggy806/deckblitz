import { defineCard } from "../define.js";

// A nonland card revealed may be cast for {1} instead of its mana cost (an
// alternative cost: X is 0, additional costs still paid — its rulings), timing
// ignored; not cast, it stays on top. A land card goes onto the battlefield,
// which isn't playing a land.
const RETURN = "Discard a card: Return Jadzi to its owner's hand.";
const MAGECRAFT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, reveal the top card of your library. If it's a nonland card, you may cast it by paying {1} rather than paying its mana cost. If it's a land card, put it onto the battlefield.";

export default defineCard({
  name: "Jadzi, Oracle of Arcavios",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
  text: `${RETURN}\n${MAGECRAFT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: RETURN,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", orCopy: true, filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "reveal-top",
        then: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { type: "land" } },
          then: { kind: "put-onto-battlefield", target: 0 },
          else: { kind: "cast-now", target: 0, byPaying: "{1}" },
        },
      },
      resolve: null,
      text: MAGECRAFT,
    },
  ],
  faces: ["Jadzi, Oracle of Arcavios", "Journey to the Oracle"],
});
