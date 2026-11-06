import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 27800.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, create a 2/1 red Klingon Warrior creature token with haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "D-7 Battle Cruiser",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 3,
  text: `${STATION_TEXT}\n3+ | ${COMBAT_TEXT}\n8+ | Flying`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(3, {
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "begin-combat", who: "you" },
          targets: [],
          effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1, sacrificeAtEndStep: true },
          resolve: null,
          text: COMBAT_TEXT,
        },
      ],
      text: `3+ | ${COMBAT_TEXT}`,
    }),
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["flying"],
      text: "8+ | Flying",
    }),
  ],
});
