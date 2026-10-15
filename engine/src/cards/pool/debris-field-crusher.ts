import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 17486. Station (rule 702.184) with one station symbol (rule
// 721.2). The pump has no symbol, so it works at any number of counters —
// on the noncreature Spacecraft too.

const ENTER_TEXT = "When this Spacecraft enters, it deals 3 damage to any target.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";
const PUMP_TEXT = "{1}{R}: This Spacecraft gets +2/+0 until end of turn.";

export default defineCard({
  name: "Debris Field Crusher",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 1,
  toughness: 5,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    station(STATION_TEXT),
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 1, toughness: 5 },
      grantKeywords: ["flying"],
      text: "8+ | Flying",
    }),
  ],
});
