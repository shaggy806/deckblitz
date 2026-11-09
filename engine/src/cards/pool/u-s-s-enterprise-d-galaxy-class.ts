import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 20558.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";
const IMPULSE =
  "Whenever one or more charge counters are put on U.S.S. Enterprise-D for the first time each turn, exile the top card of your library. You may play that card this turn.";

export default defineCard({
  name: "U.S.S. Enterprise-D, Galaxy-Class",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 5,
  text: `${IMPULSE}\n${STATION_TEXT}\n7+ | Flying, vigilance`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "charge", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", play: true },
      resolve: null,
      text: IMPULSE,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 5 },
      grantKeywords: ["flying", "vigilance"],
      text: "7+ | Flying, vigilance",
    }),
  ],
});
