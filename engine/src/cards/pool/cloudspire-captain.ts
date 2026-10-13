import { defineCard } from "../define.js";

// EDHREC rank 10396.
//
// "Mounts and Vehicles you control get +1/+1": a noncreature Vehicle's
// printed P/T only counts once it's a creature (rule 301.7b).
const ANTHEM_TEXT = "Mounts and Vehicles you control get +1/+1.";
const PILOT_TEXT = "This creature saddles Mounts and crews Vehicles as though its power were 2 greater.";

export default defineCard({
  name: "Cloudspire Captain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 3,
  text: `${ANTHEM_TEXT}\n${PILOT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Mount", "Vehicle"], controlledBy: "you" } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
    { affects: { scope: "self" }, crewsAs: { plus: 2, saddles: true }, text: PILOT_TEXT },
  ],
});
