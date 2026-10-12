import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 12757.

const ENTER_TEXT = "When this Spacecraft enters, put a +1/+1 counter on each creature you control.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

// "Each creature you control" as the trigger resolves: the Spacecraft itself
// only if it's a creature by then (8+ charge counters, or made one).
export default defineCard({
  name: "Atmospheric Greenhouse",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying, trample`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 4 },
      grantKeywords: ["flying", "trample"],
      text: "8+ | Flying, trample",
    }),
  ],
});
