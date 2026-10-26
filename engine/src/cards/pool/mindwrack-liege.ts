import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 19896.
//
// The two bonuses are separate and cumulative: another creature that's both
// blue and red gets +2/+2 (the ruling).

const BLUE_TEXT = "Other blue creatures you control get +1/+1.";
const RED_TEXT = "Other red creatures you control get +1/+1.";
const PUT_TEXT = "{U/R}{U/R}{U/R}{U/R}: You may put a blue or red creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Mindwrack Liege",
  manaCost: "{3}{U/R}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: `${BLUE_TEXT}\n${RED_TEXT}\n${PUT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["U"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: BLUE_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["R"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: RED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{U/R}{U/R}{U/R}{U/R}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", anyOf: [{ colors: ["U"] }, { colors: ["R"] }] },
      },
      resolve: null,
      text: PUT_TEXT,
    },
  ],
});
