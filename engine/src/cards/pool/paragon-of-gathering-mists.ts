import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 21375.
//
// Rulings:
//   [2014-07-18] Causing a creature to gain flying after it’s been blocked won’t change or undo
//     that block.

const ANTHEM = "Other blue creatures you control get +1/+1.";
const ACTIVATED = "{U}, {T}: Another target blue creature you control gains flying until end of turn.";

export default defineCard({
  name: "Paragon of Gathering Mists",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${ACTIVATED}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", colors: ["U"] } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
