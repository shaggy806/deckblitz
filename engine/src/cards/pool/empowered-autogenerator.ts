import { defineCard } from "../define.js";

// EDHREC rank 3982.
//
// The charge counter comes first and X is read after it (`add-mana`'s
// `first`), so the counter it puts counts — doubled under Doubling Season,
// as an effect's counters are. Still one mana ability (its ruling): no stack.
const TAP_TEXT =
  "{T}: Put a charge counter on this artifact. Add X mana of any one color, where X is the number of charge counters on this artifact.";

export default defineCard({
  name: "Empowered Autogenerator",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { countersOn: "source", counter: "charge" },
        first: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: TAP_TEXT,
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
