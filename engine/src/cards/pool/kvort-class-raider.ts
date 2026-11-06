import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// Star Trek Commander (TRC). "This Spacecraft" has hexproof during your turn
// whether or not it's a creature yet: its own static beside the creatures'.

const HEXPROOF_TEXT = "During your turn, this Spacecraft and creatures you control have hexproof.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 4+.)";

export default defineCard({
  name: "K'Vort-Class Raider",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 3,
  text: `${HEXPROOF_TEXT}\n${STATION_TEXT}\n4+ | Flying, menace, haste`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "your-turn" },
      grantKeywords: ["hexproof"],
      text: HEXPROOF_TEXT,
    },
    stationBand(4, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 3 },
      grantKeywords: ["flying", "menace", "haste"],
      text: "4+ | Flying, menace, haste",
    }),
  ],
  activated: [station(STATION_TEXT)],
});
