import { defineCard } from "../define.js";

// EDHREC rank 32008.
//
// Rulings:
//   [2009-10-01] The abilities from multiple Ivory Guardians are cumulative. For example, if you
//     control two different Ivory Guardians and an opponent controls a nontoken red permanent,
//     each of your Ivory Guardians will be 5/5.
//   [2009-10-01] The ability of an Ivory Guardians will affect itself as well as all other
//     creatures named Ivory Guardians (not just the ones you control).
//   [2009-10-01] Each ability applies a maximum of once, even if an opponent controls multiple
//     nontoken red permanents or multiple opponents each control a nontoken red permanent.
//
// Every creature named Ivory Guardians, anyone's, gets the bonus once per
// Ivory Guardians whose controller has an opponent with a nontoken red
// permanent.
const PUMP_TEXT = "Creatures named Ivory Guardians get +1/+1 as long as an opponent controls a nontoken red permanent.";

export default defineCard({
  name: "Ivory Guardians",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Cleric"],
  power: 3,
  toughness: 3,
  text: `Protection from red\n${PUMP_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" },
    {
      affects: { scope: "filter", filter: { type: "creature", name: "Ivory Guardians" } },
      condition: { kind: "opponent-controls", filter: { colors: ["R"], token: false }, atLeast: 1 },
      grantPt: [1, 1],
      text: PUMP_TEXT,
    },
  ],
});
