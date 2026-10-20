import { defineCard } from "../define.js";

// EDHREC rank 22786. Tangle Tumbler's shape with creatures: a Vehicle with no
// crew ability. Once it's a creature, it may be one of the two tapped.
const TEXT = "Tap two untapped creatures you control: This Vehicle becomes an artifact creature until end of turn.";

export default defineCard({
  name: "Honeymoon Hearse",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
