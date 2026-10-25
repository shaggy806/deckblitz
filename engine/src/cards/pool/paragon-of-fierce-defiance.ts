import { defineCard } from "../define.js";

const ANTHEM_TEXT = "Other red creatures you control get +1/+1.";
const HASTE_TEXT = "{R}, {T}: Another target red creature you control gains haste until end of turn.";

export default defineCard({
  name: "Paragon of Fierce Defiance",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM_TEXT}\n${HASTE_TEXT} (It can attack and {T} this turn.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature", colors: ["R"], controlledBy: "you" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: HASTE_TEXT,
    },
  ],
});
