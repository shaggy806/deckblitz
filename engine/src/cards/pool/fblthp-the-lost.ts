import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 9227.
//
// The enters draw reads where Fblthp came from: entered from a library
// (`enteredFrom`), or cast from one (`castFrom` — its entry itself is from
// the stack). Cast from exile after being exiled from the library is neither
// (its ruling). The second trigger is Dream Strix's "becomes the target of a
// spell" shape: only while it's on the battlefield, and it resolves before
// the spell, even one that's then countered (its rulings).

const ENTER_TEXT =
  "When Fblthp enters, draw a card. If it entered from your library or was cast from your library, draw two cards instead.";
const TARGET_TEXT = "When Fblthp becomes the target of a spell, shuffle Fblthp into its owner's library.";

export default defineCard({
  name: "Fblthp, the Lost",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${TARGET_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "any",
          of: [
            { kind: "source", filter: { enteredFrom: "library" } },
            { kind: "source", filter: { castFrom: "library" } },
          ],
        },
        then: { kind: "draw", amount: 2 },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "source" },
      resolve: null,
      text: TARGET_TEXT,
    },
  ],
});
