import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 8951.

const ETB_TEXT = "When this Spacecraft enters, it deals 10 damage to up to one target creature.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";

export default defineCard({
  name: "Pinnacle Kill-Ship",
  manaCost: "{7}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 7,
  toughness: 7,
  text: `${ETB_TEXT}\n${STATION_TEXT}\n7+ | Flying`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "damage", amount: 10, target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 7, toughness: 7 },
      grantKeywords: ["flying"],
      text: "7+ | Flying",
    }),
  ],
});
