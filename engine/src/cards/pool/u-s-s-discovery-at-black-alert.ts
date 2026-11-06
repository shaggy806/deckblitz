import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 25047.

const DISCOVER_TEXT =
  "Whenever U.S.S. Discovery enters or attacks, discover 5. (Exile cards from the top of your library until you exile a nonland card with mana value 5 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "U.S.S. Discovery, at Black Alert",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `${DISCOVER_TEXT}\n${STATION_TEXT}\n6+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discover", amount: 5 },
      resolve: null,
      text: DISCOVER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "discover", amount: 5 },
      resolve: null,
      text: DISCOVER_TEXT,
    },
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying"],
      text: "6+ | Flying",
    }),
  ],
});
