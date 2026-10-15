import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 15316.

const ENTER_TEXT = "When this Spacecraft enters, each opponent sacrifices a nontoken creature of their choice.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";

export default defineCard({
  name: "Susurian Dirgecraft",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n7+ | Flying`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature", token: false }, count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["flying"],
      text: "7+ | Flying",
    }),
  ],
});
