import { defineCard } from "../define.js";

// A playtest card (Mystery Booster 2), Moonmist's shape. "On their front
// face": a transformed permanent (back face up) isn't turned back. Anything
// that can't transform (a single-faced permanent) stays as it is (rule
// 701.27c).

export default defineCard({
  name: "That's No Moonmist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Transform all artifacts and Phyrexian creatures on their front face. Prevent all combat damage that would be dealt this turn by creatures other than Phyrexians. (Only double-faced cards and tokens can be transformed.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: {
          anyOf: [{ type: "artifact" }, { type: "creature", subtype: "Phyrexian" }],
          not: { transformed: true },
        },
        simultaneous: true,
        effect: { kind: "transform", target: 0 },
      },
      { kind: "prevent-all-combat-damage", by: { type: "creature", notSubtypes: ["Phyrexian"] } },
    ],
  },
});
