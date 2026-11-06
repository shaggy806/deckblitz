import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 4+.)";
const ASSAULT_TEXT =
  "Multivector Assault Mode — Whenever U.S.S. Prometheus deals combat damage to an opponent, it deals that much damage to each other opponent.";

export default defineCard({
  name: "U.S.S. Prometheus, Prototype",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 6,
  toughness: 6,
  text: `${STATION_TEXT}\n4+ | Flying\n8+ | ${ASSAULT_TEXT}`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(4, {
      addTypes: ["creature"],
      setBasePt: { power: 6, toughness: 6 },
      grantKeywords: ["flying"],
      text: "4+ | Flying",
    }),
    stationBand(8, {
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
          targets: [],
          effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
          resolve: null,
          text: ASSAULT_TEXT,
        },
      ],
      text: `8+ | ${ASSAULT_TEXT}`,
    }),
  ],
});
