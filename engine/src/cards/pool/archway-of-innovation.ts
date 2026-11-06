import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// Modern Horizons 3. EDHREC rank 926.
//
// "The next spell you cast this turn has improvise" is a `grant-spells-this-turn`
// with `next`: the first spell its controller casts after it resolves uses it
// up as it becomes cast (rule 601.2i), and has improvise (702.126a) while it's
// being cast — its artifacts tapped after the mana abilities each pay {1} of
// the total cost, never a coloured pip (the rulings). Not an alternative cost,
// so it goes with one (702.126b); a second instance is redundant (702.126c).
const ENTERS_TEXT = "This land enters tapped unless you control an Island.";
const GRANT_TEXT =
  "{U}, {T}: The next spell you cast this turn has improvise. (Your artifacts can help cast that spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)";

export default defineCard({
  name: "Archway of Innovation",
  colors: [],
  types: ["land"],
  text: `${ENTERS_TEXT}\n{T}: Add {U}.\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    manaTapAbility("U"),
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, improvise: true },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
});
