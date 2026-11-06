import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 10+.)";
const DIES_TEXT = "Whenever a creature dies, if Sarcophagus isn't a creature, put a charge counter on it.";

export default defineCard({
  name: "Sarcophagus, Ship of the Dead",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `Other creatures you control get +1/+0.\n${DIES_TEXT}\n${STATION_TEXT}\n10+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" } },
      // Intervening-if (rule 603.4): checked as it dies and again as it resolves.
      condition: { kind: "source", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 0],
      text: "Other creatures you control get +1/+0.",
    },
    stationBand(10, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: "10+ | Flying",
    }),
  ],
});
