import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 11401.
//
// The enters trigger: one optional slot per opponent seat, returned together
// (Vronos, Masked Inquisitor's −2).

const PROWL_TEXT =
  "Prowl {3}{U} (You may cast this spell for its prowl cost if you dealt combat damage to a player this turn with a Sphinx or Rogue.)";
const ENTER_TEXT =
  "When this creature enters, for each opponent, return up to one target nonland permanent that player controls to its owner's hand.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { notTypes: ["land"] } },
});

export default defineCard({
  name: "Enigma Thief",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Rogue"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `${PROWL_TEXT}\nFlying\n${ENTER_TEXT}`,
  alternativeCost: prowl("{3}{U}"),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0 },
          { kind: "return-to-hand", target: 1 },
          { kind: "return-to-hand", target: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
