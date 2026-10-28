import { defineCard } from "../define.js";

// EDHREC rank 24858.
//
// Weatherseed Totem's animation; the block limit is a `blockAdditional` static
// gated on its being a creature (cumulative with another, the ruling).
//
// Rulings:
//   If an effect says Foriysian Totem can't block, then it can't block any creatures.
//   The third ability normally lets Foriysian Totem block two creatures. If another effect also
//     lets it block an additional creature, the effects are cumulative.

const ANIMATE_TEXT = "{4}{R}: This artifact becomes a 4/4 red Giant artifact creature with trample until end of turn.";
const BLOCK_TEXT = "As long as this artifact is a creature, it can block an additional creature each combat.";

export default defineCard({
  name: "Foriysian Totem",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `{T}: Add {R}.\n${ANIMATE_TEXT}\n${BLOCK_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Giant"],
        setColors: ["R"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      blockAdditional: 1,
      text: BLOCK_TEXT,
    },
  ],
});
