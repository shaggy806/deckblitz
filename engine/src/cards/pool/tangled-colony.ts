import { defineCard } from "../define.js";

// EDHREC rank 5973.
//
// X is all the damage dealt to it this turn, by any source, in the stint
// that just ended (Blazing Effigy's `damageDealtThisTurn` read, `to:
// "source"`, without its "by"): damage beyond lethal counts, damage
// prevented doesn't, and damage from an earlier turn has gone.
const CANT_BLOCK_TEXT = "This creature can't block.";
const DIES_TEXT =
  'When this creature dies, create X 1/1 black Rat creature tokens with "This token can\'t block," where X is the amount of damage dealt to it this turn.';

export default defineCard({
  name: "Tangled Colony",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 3,
  toughness: 2,
  text: `${CANT_BLOCK_TEXT}\n${DIES_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: CANT_BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Rat Token (Can't Block)",
        count: { damageDealtThisTurn: true, who: "each-player", to: "source" },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
