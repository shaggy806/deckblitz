import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 8498.
//
// Only a creature attacks, so the attack trigger matters from 7+ on; the
// creature card is put onto the battlefield, not attacking (Elvish Piper's
// shape).

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";
const ATTACK_TEXT =
  "Whenever this Spacecraft attacks, you may put a creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Sledge-Class Seedship",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 5,
  text: `${STATION_TEXT}\n7+ | Flying\n${ATTACK_TEXT}`,
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 5 },
      grantKeywords: ["flying"],
      text: "7+ | Flying",
    }),
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
