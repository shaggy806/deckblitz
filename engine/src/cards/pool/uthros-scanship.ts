import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 14293.

const ENTER_TEXT = "When this Spacecraft enters, draw two cards, then discard a card.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "Uthros Scanship",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
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
