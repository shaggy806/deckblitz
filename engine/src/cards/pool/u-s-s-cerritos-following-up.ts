import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

const ENTER = "When U.S.S. Cerritos enters, create two 1/1 red Officer creature tokens.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "U.S.S. Cerritos, Following Up",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${ENTER}\n${STATION_TEXT}\n6+ | Flying`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: "6+ | Flying",
    }),
  ],
});
