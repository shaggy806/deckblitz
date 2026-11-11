import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Fallout Commander. EDHREC rank 5418.
//
// The choice is made as the land is about to enter, and the rad counters come
// as it does: one replacement effect (rule 614.1c), not a trigger.
const ENTER_TEXT = "You may have this land enter tapped. If you do, you get two rad counters.";
const DRAW_TEXT = "{5}, {T}: Draw a card. This ability costs {1} less to activate for each rad counter you have.";

export default defineCard({
  name: "Mariposa Military Base",
  types: ["land"],
  text: `${ENTER_TEXT}\n{T}: Add {C}.\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        mayEnterTapped: { then: { kind: "add-player-counters", counter: "rad", amount: 2 } },
      },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: "{5}", tap: true },
      costReduction: { reduceGeneric: { playerCounters: "rad" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
