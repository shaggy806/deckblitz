import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 21262.
//
// The combat damage trigger follows the 16+ line, so it is part of that
// station symbol's static ability (rule 721.2), as Sledge-Class Seedship's is.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, put four charge counters on Starship Enterprise.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 16+.)";
const DAMAGE_TEXT = "Whenever Starship Enterprise deals combat damage to a player, draw that many cards.";

export default defineCard({
  name: "Starship Enterprise",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 6,
  text: `${LANDFALL_TEXT}\n${STATION_TEXT}\n16+ | Flying\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 4 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(16, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 6 },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: { triggerValue: true } },
          resolve: null,
          text: DAMAGE_TEXT,
        },
      ],
      text: `16+ | Flying\n${DAMAGE_TEXT}`,
    }),
  ],
});
