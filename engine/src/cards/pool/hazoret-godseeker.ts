import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 9233. The target's power is checked only as the ability
// resolves: one that grows to 3 afterwards still can't be blocked, and one
// already blocked stays blocked (the rulings).
const UNBLOCKABLE_TEXT = "{1}, {T}: Target creature with power 2 or less can't be blocked this turn.";
const RESTRICTION_TEXT = "Hazoret can't attack or block unless you have max speed.";

export default defineCard({
  name: "Hazoret, Godseeker",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 5,
  toughness: 3,
  keywords: ["indestructible", "haste", "start-your-engines"],
  text: `Indestructible, haste\n${START_YOUR_ENGINES_TEXT}\n${UNBLOCKABLE_TEXT}\n${RESTRICTION_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      // "Unless you have max speed" (rule 702.179e).
      condition: { kind: "speed", atMost: 3 },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICTION_TEXT,
    },
  ],
});
