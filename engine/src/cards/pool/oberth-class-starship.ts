import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 29935.

const ENTER_TEXT =
  "When this Spacecraft enters, search your library for a basic Plains card, reveal it, put it into your hand, then shuffle.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "Oberth-Class Starship",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n6+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtype: "Plains" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 2, toughness: 2 },
      grantKeywords: ["flying"],
      text: "6+ | Flying",
    }),
  ],
});
