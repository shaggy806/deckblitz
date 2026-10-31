import { defineCard } from "../define.js";

// Tarkir: Dragonstorm (TDM). EDHREC rank 5234.
//
// X — the lands you control — is counted as the trigger is put on the stack,
// when the number of targets and the division are announced (rules 603.3d,
// 601.2d), at least 1 to each target; a target gone illegal loses its share
// (608.2b).

const ENTERS_TEXT =
  "When Ureni enters, it deals X damage divided as you choose among any number of target creatures and/or planeswalkers your opponents control, where X is the number of lands you control.";

export default defineCard({
  name: "Ureni, the Song Unending",
  manaCost: "{5}{G}{U}{R}",
  colors: ["G", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Dragon"],
  power: 10,
  toughness: 10,
  text: `Flying, protection from white and from black\n${ENTERS_TEXT}`,
  keywords: ["flying"],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W", "B"] },
      text: "Protection from white and from black",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } },
        },
      ],
      divided: { total: { countOf: { type: "land", controlledBy: "you" } }, slot: 0 },
      effect: { kind: "damage-divided", from: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
