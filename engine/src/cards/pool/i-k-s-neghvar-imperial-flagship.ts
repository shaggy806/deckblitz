import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 30537.

const VIGILANCE_TEXT = "Klingons and Warriors you control have vigilance.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 10+.)";

export default defineCard({
  name: "I.K.S. Negh'Var, Imperial Flagship",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 6,
  toughness: 6,
  text: `${VIGILANCE_TEXT}\n${STATION_TEXT}\n10+ | Flying, vigilance`,
  activated: [station(STATION_TEXT)],
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Klingon", "Warrior"], controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
    stationBand(10, {
      addTypes: ["creature"],
      setBasePt: { power: 6, toughness: 6 },
      grantKeywords: ["flying", "vigilance"],
      text: "10+ | Flying, vigilance",
    }),
  ],
});
