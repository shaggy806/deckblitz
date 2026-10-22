import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30212.
//
// Exactly X targets (By Force's group); "can't be blocked this turn" is a
// restriction, not a granted keyword (rule 611.2c).

const TEXT = "{X}, {T}, Sacrifice this artifact: X target creatures with power 2 or less can't be blocked this turn.";

export default defineCard({
  name: "Runed Arch",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{X}", tap: true, sacrifice: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } },
          min: "x",
          max: "x",
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
