import { defineCard } from "../define.js";

// The discarded card's mana value is read from the card the cost discarded
// (`LastKnownRefs.discarded`), in the graveyard it went to.

const TEXT =
  "{1}{B}, Discard a creature card: Volrath gets +X/+X until end of turn, where X is the discarded card's mana value.";

export default defineCard({
  name: "Volrath the Fallen",
  manaCost: "{3}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Phyrexian", "Shapeshifter"],
  power: 6,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: { paid: "discarded" } },
        toughness: { manaValueOf: { paid: "discarded" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
