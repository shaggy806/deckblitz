import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 8850.
//
// The 2+ anthem reaches other creatures, so it passes its own `affects`
// (The Seriema's shape); "other" leaves the Frigate out once it's a creature.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 12+.)";
const ANTHEM_TEXT = "Other creatures you control get +1/+1.";

export default defineCard({
  name: "Lumen-Class Frigate",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 5,
  text: `${STATION_TEXT}\n2+ | ${ANTHEM_TEXT}\n12+ | Flying, lifelink`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(2, { grantPt: [1, 1], text: `2+ | ${ANTHEM_TEXT}` }, { scope: "creatures-you-control", excludeSelf: true }),
    stationBand(12, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 5 },
      grantKeywords: ["flying", "lifelink"],
      text: "12+ | Flying, lifelink",
    }),
  ],
});
