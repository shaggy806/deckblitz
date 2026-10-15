import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 16932.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 3+.)";

export default defineCard({
  name: "Galvanizing Sawship",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 6,
  toughness: 5,
  text: `${STATION_TEXT}\n3+ | Flying, haste`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(3, {
      addTypes: ["creature"],
      setBasePt: { power: 6, toughness: 5 },
      grantKeywords: ["flying", "haste"],
      text: "3+ | Flying, haste",
    }),
  ],
});
