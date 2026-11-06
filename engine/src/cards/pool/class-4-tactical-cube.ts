import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 23663.
//
// "Artifact creatures you control get +1/+1" follows the 7+ line, so it is part
// of that station symbol's static ability (rule 721.2), as Sledge-Class
// Seedship's attack trigger is.

const ENTER_TEXT = "When this Spacecraft enters, create two 1/1 colorless Borg artifact creature tokens.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";
const LORD_TEXT = "Artifact creatures you control get +1/+1.";

export default defineCard({
  name: "Class-4 Tactical Cube",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n7+ | Flying\n${LORD_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Borg Token", count: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying"],
      text: `7+ | Flying\n${LORD_TEXT}`,
    }),
    stationBand(
      7,
      { grantPt: [1, 1], text: LORD_TEXT },
      { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
    ),
  ],
});
