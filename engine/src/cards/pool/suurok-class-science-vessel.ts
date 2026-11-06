import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 29839.

const ENTER_TEXT = "When this Spacecraft enters, draw a card.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 5+.)";

export default defineCard({
  name: "Suurok-Class Science Vessel",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n5+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(5, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 2 },
      grantKeywords: ["flying"],
      text: "5+ | Flying",
    }),
  ],
});
