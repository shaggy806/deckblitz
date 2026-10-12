import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 10120.

const ENTER_TEXT =
  "When this Spacecraft enters, it deals damage equal to the number of artifacts you control to target creature an opponent controls.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "Warmaker Gunship",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n6+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // Counted as it resolves, the Gunship itself among them.
      effect: { kind: "damage", target: 0, amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["flying"],
      text: "6+ | Flying",
    }),
  ],
});
