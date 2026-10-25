import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 20956.

const ANTHEM = "Other white creatures you control get +1/+1.";
const ACTIVATED = "{W}, {T}: Another target white creature you control gains vigilance until end of turn.";

export default defineCard({
  name: "Paragon of New Dawns",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${ACTIVATED} (Attacking doesn't cause it to tap.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["W"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", colors: ["W"] } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
