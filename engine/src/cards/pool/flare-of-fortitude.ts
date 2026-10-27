import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 735.
//
// "You may sacrifice a nontoken white creature rather than pay this spell's
// mana cost": an alternative cost (rule 118.9), the creature chosen as the
// cost is paid (601.2h). "Your life total can't change" (rules 119.7–8) is
// the player effect Teferi's Protection uses, here until end of turn; the
// grants are Heroic Intervention's.

export default defineCard({
  name: "Flare of Fortitude",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You may sacrifice a nontoken white creature rather than pay this spell's mana cost.\nUntil end of turn, your life total can't change, and permanents you control gain hexproof and indestructible.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature", colors: ["W"], token: false }, text: "a nontoken white creature" },
  },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", lifeCantChange: "you" },
      { kind: "grant-keyword-all", filter: { controlledBy: "you" }, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { controlledBy: "you" }, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
