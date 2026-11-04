import { defineCard } from "../define.js";

// EDHREC rank 377.
//
// Rulings:
//   [2025-04-04] You must already control a Mountain or Forest as Mistrise Village enters for it to
//     enter untapped. If it enters at the same time as a Mountain or Forest when you control no
//     other Mountains or Forests, it will enter tapped.
//
// Overmaster's `next` can't-be-countered grant, for any spell: used up by the
// first spell its controller casts after the ability resolves.

const ENTERS = "This land enters tapped unless you control a Mountain or a Forest.";
const TAP = "{T}: Add {U}.";
const NEXT = "{U}, {T}: The next spell you cast this turn can't be countered.";

export default defineCard({
  name: "Mistrise Village",
  colors: [],
  types: ["land"],
  text: `${ENTERS}\n${TAP}\n${NEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtypes: ["Mountain", "Forest"] }, atLeast: 1 },
      },
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: TAP,
    },
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, cantBeCountered: true },
      resolve: null,
      text: NEXT,
    },
  ],
});
