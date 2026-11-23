import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// A 0/0 colorless Vehicle artifact token with flying, "This creature gets
// +1/+1 for each Bear you control," and crew 2 (The Bear Force Pilot
// Runner's). No token printing exists for it.

const PUMP = "This creature gets +1/+1 for each Bear you control.";

export default defineCard({
  name: "0/0 Flying Bear Vehicle Token",
  tokenName: "Vehicle",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${PUMP}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This token becomes an artifact creature until end of turn.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Bear", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP,
    },
  ],
  activated: [crew(2)],
});
