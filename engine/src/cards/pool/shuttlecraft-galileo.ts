import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// Star Trek Commander (TRC).

const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, create a 1/1 red Officer creature token.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";
const ATTACK_TEXT = "Whenever Shuttlecraft Galileo attacks, up to seven target attacking creatures gain flying until end of turn.";

export default defineCard({
  name: "Shuttlecraft Galileo",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 3,
  text: `${LANDFALL_TEXT}\n${STATION_TEXT}\n6+ | Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["flying"],
      // The line after "6+ | Flying" is part of that station symbol's ability
      // (rule 721.2).
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: true } }, max: 7 }],
          effect: {
            kind: "for-each-target",
            from: 0,
            effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          },
          resolve: null,
          text: ATTACK_TEXT,
        },
      ],
      text: "6+ | Flying",
    }),
  ],
});
