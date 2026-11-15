import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 26494.

const CLOAK_TEXT = "Cloaking Device — As long as this Spacecraft isn't a creature, it has hexproof.";
const CAST_TEXT =
  "Whenever you cast a noncreature spell, if this Spacecraft isn't a creature, put two charge counters on it.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";
const BAND_TEXT = "8+ | Flying";

// "Isn't a creature" is read with its station band applied (layer 4 before
// the hexproof of layer 6, rule 613.1): at 8+ it has no hexproof.
export default defineCard({
  name: "Romulan Bird-of-Prey",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${CLOAK_TEXT}\n${CAST_TEXT}\n${STATION_TEXT}\n${BAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } },
      condition: { kind: "source", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 2 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { notTypes: ["creature"] } },
      grantKeywords: ["hexproof"],
      text: CLOAK_TEXT,
    },
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: BAND_TEXT,
    }),
  ],
});
