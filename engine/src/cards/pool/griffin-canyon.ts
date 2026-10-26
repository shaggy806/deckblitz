import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 18153.
//
// Rulings:
//   This can target an already untapped Griffin, and gives the bonus regardless.
//
// "Target Griffin" is any permanent with the subtype; the +1/+1 is gated on it
// being a creature as the ability resolves.

const TEXT = "{T}: Untap target Griffin. If it's a creature, it gets +1/+1 until end of turn.";

export default defineCard({
  name: "Griffin Canyon",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Griffin" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "creature" } },
            then: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
