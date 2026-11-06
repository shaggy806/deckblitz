import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 22889.

const ENTER_TEXT = "When this Spacecraft enters, draw a card.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";
const BAND_TEXT = "6+ | Artifact creatures you control have flying.";

export default defineCard({
  name: "Borg Scout Sphere",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n${BAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(6, { addTypes: ["creature"], setBasePt: { power: 5, toughness: 5 }, text: BAND_TEXT }),
    stationBand(
      6,
      { grantKeywords: ["flying"], text: BAND_TEXT },
      { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
    ),
  ],
});
