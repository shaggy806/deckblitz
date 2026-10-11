import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 6874.
//
// Rulings:
//   [2019-10-04] The Circle of Loyalty's triggered ability won't trigger when you cast it because
//     it's not on the battlefield yet.
//   [2019-10-04] The cost reduction ability reduces only the generic mana in the relic's cost. The
//     colored mana must still be paid.
//   [2019-10-04] The Circle of Loyalty's triggered ability resolves before the spell that caused it
//     to trigger. It resolves even if that spell is countered.

const ANTHEM_TEXT = "Creatures you control get +1/+1.";
const CAST_TEXT = "Whenever you cast a legendary spell, create a 2/2 white Knight creature token with vigilance.";
const MAKE_TEXT = "{3}{W}, {T}: Create a 2/2 white Knight creature token with vigilance.";
const KNIGHT = { kind: "create-token", token: "Knight Token", count: 1 } as const;

export default defineCard({
  name: "The Circle of Loyalty",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  selfCostReduction: affinity({ subtype: "Knight" }),
  text:
    "Affinity for Knights (This spell costs {1} less to cast for each Knight you control.)\n" +
    `${ANTHEM_TEXT}\n${CAST_TEXT}\n${MAKE_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control" }, grantPt: [1, 1], text: ANTHEM_TEXT }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { supertype: "legendary" } },
      targets: [],
      effect: KNIGHT,
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true },
      targets: [],
      effect: KNIGHT,
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
