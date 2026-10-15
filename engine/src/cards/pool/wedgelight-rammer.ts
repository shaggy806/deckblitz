import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 15029.

const ENTER_TEXT = "When this Spacecraft enters, create a 2/2 colorless Robot artifact creature token.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 9+.)";

export default defineCard({
  name: "Wedgelight Rammer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n9+ | Flying, first strike`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(9, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 4 },
      grantKeywords: ["flying", "first-strike"],
      text: "9+ | Flying, first strike",
    }),
  ],
});
