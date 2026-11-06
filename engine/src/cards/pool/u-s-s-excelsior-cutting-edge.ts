import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 28218.

const ENTER_TEXT = "When U.S.S. Excelsior enters, destroy target tapped creature an opponent controls.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "U.S.S. Excelsior, Cutting Edge",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true, controlledBy: "opponent" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: "8+ | Flying",
    }),
  ],
});
