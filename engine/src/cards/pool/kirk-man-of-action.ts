import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT = "Other Officers, Artificers, Doctors, Pilots, Scientists, and Spacecraft creatures you control get +2/+2.";

export default defineCard({
  name: "Kirk, Man of Action",
  manaCost: "{2}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          subtypes: ["Officer", "Artificer", "Doctor", "Pilot", "Scientist", "Spacecraft"],
        },
        excludeSelf: true,
      },
      grantPt: [2, 2],
      text: TEXT,
    },
  ],
});
