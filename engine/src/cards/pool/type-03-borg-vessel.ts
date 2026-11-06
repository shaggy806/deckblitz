import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// Star Trek Commander (TRC).

const COST_TEXT = "Artifact spells you cast cost {1} less to cast.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";
const CAST_TEXT = "Whenever you cast a spell, create a 1/1 colorless Borg artifact creature token.";

export default defineCard({
  name: "Type-03 Borg Vessel",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `${COST_TEXT}\n${STATION_TEXT}\n7+ | Flying\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "artifact", controlledBy: "you" }, reduceGeneric: 1 },
      text: COST_TEXT,
    },
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying"],
      // The line after "7+ | Flying" is part of that station symbol's ability
      // (rule 721.2): no tokens below 7 charge counters.
      grantsTriggered: [
        {
          trigger: { on: "cast-spell", who: "you" },
          targets: [],
          effect: { kind: "create-token", token: "Borg Token", count: 1 },
          resolve: null,
          text: CAST_TEXT,
        },
      ],
      text: "7+ | Flying",
    }),
  ],
  activated: [station(STATION_TEXT)],
});
