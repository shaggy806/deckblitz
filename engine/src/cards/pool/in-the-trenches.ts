import { defineCard } from "../define.js";

// "Exile … until this enchantment leaves the battlefield" is the one-shot
// return of rule 610.3 (`untilSourceLeaves`), so the card comes back even if
// the owner has left the game (the ruling). "Activate only once" is once for
// as long as this object exists (`exhaust`, cleared by a zone change — the
// ruling), and countered still counts.
const EXILE_TEXT =
  "{5}{W}: Exile target nonland permanent you don't control until this enchantment leaves the battlefield. Activate only as a sorcery and only once.";

export default defineCard({
  name: "In the Trenches",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `Creatures you control get +1/+1.\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      text: "Creatures you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{W}", tap: false },
      // "You don't control": every other player is an opponent (no teams).
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
      sorcerySpeed: true,
      exhaust: true,
    },
  ],
});
