import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 14798. "Rather than pay Heart of Kiran's crew cost" is an
// alternative cost for its own crew abilities (rule 602.2b applies 601.2b's
// choice of one to an activated ability): `alternativeAbilityCost`'s
// `"crew"`, offered beside Crew 3 as a second way to activate it. The crew
// ability still resolves and the Vehicle becomes crewed (702.122e), by no
// creature (702.122c). The counter is chosen as the cost is paid, from a
// planeswalker of yours (`removeCounter.from`).
//
// Rulings:
//   [2017-02-09] Paying Heart of Kiran's alternative crew cost isn't a loyalty ability. It can be
//     done even if you've already activated a loyalty ability of the planeswalker this turn, and
//     it can be done any time you could activate Heart of Kiran's crew ability.

const ALT_TEXT = "You may remove a loyalty counter from a planeswalker you control rather than pay Heart of Kiran's crew cost.";

export default defineCard({
  name: "Heart of Kiran",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${crewText(3)}\n${ALT_TEXT}`,
  activated: [crew(3, crewText(3))],
  static: [
    {
      affects: { scope: "self" },
      alternativeAbilityCost: {
        kind: "crew",
        cost: { mana: null, tap: false, removeCounter: { kind: "loyalty", count: 1, from: { type: "planeswalker" } } },
        costText: "Remove a loyalty counter from a planeswalker you control",
      },
      text: ALT_TEXT,
    },
  ],
});
