import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 25615.

const ENTER_TEXT = "When U.S.S. Enterprise-E enters, destroy all tapped creatures.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "U.S.S. Enterprise-E, Sovereign",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 7,
  toughness: 7,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying, vigilance`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", tapped: true } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 7, toughness: 7 },
      grantKeywords: ["flying", "vigilance"],
      text: "8+ | Flying, vigilance",
    }),
  ],
});
