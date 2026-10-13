import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// EDHREC rank 6986.
// Makes Spirit → "Spirit Token (Great Arashin City)" (a plain 1/1 white Spirit).
//
// Rulings:
//   [2025-04-04] You must already control a Forest or Plains as Great Arashin City enters for it
//     to enter untapped. If it enters at the same time as a Forest or Plains when you control no
//     other Forests or Plains, it will enter tapped.

const SPIRIT_TEXT = "{1}{B}, {T}, Exile a creature card from your graveyard: Create a 1/1 white Spirit creature token.";

export default defineCard({
  name: "Great Arashin City",
  colors: [],
  types: ["land"],
  text: `This land enters tapped unless you control a Forest or a Plains.\n{T}: Add {B}.\n${SPIRIT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "controls", filter: { subtypes: ["Forest", "Plains"] }, atLeast: 1 },
      },
      text: "This land enters tapped unless you control a Forest or a Plains.",
    },
  ],
  activated: [
    manaTapAbility("B"),
    {
      cost: { mana: "{1}{B}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 1 },
      resolve: null,
      text: SPIRIT_TEXT,
    },
  ],
});
