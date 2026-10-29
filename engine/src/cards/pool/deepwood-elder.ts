import { defineCard } from "../define.js";

// EDHREC rank 30088.
//
// "Become Forests" sets their land types (rule 305.7): each loses the
// abilities its rules text gave it and has "{T}: Add {G}" until end of turn —
// `add-types`' `setSubtypes` of a basic land type.

const TEXT = "{X}{G}{G}, {T}, Discard a card: X target lands become Forests until end of turn.";

export default defineCard({
  name: "Deepwood Elder",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}{G}{G}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "any-number", of: "land", min: "x", max: "x" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-types", target: 0, setSubtypes: ["Forest"], duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
