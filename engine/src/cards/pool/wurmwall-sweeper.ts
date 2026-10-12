import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 12729.

const ENTER_TEXT = "When this Spacecraft enters, surveil 2.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 4+.)";

export default defineCard({
  name: "Wurmwall Sweeper",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n4+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(4, {
      addTypes: ["creature"],
      setBasePt: { power: 2, toughness: 2 },
      grantKeywords: ["flying"],
      text: "4+ | Flying",
    }),
  ],
});
