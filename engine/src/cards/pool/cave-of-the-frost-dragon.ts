import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] If you turn Cave of the Frost Dragon into a creature but haven't controlled it
//     continuously since your most recent turn began, you won't be able to activate its mana
//     ability or attack with it.
//   [2021-07-23] If Cave of the Frost Dragon enters the battlefield at the same time as one or
//     more other lands, it doesn't take those lands into consideration when determining how many
//     other lands you control.

const ENTRY_TEXT = "If you control two or more other lands, this land enters tapped.";
const ANIMATE_TEXT =
  "{4}{W}: This land becomes a 3/4 white Dragon creature with flying until end of turn. It's still a land.";

export default defineCard({
  name: "Cave of the Frost Dragon",
  colors: [],
  types: ["land"],
  text: `${ENTRY_TEXT}\n{T}: Add {W}.\n${ANIMATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 2 } },
      },
      text: ENTRY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Dragon"],
        setColors: ["W"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
