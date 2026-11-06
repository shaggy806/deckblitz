import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 28727.

const ENTER_TEXT =
  "When U.S.S. Voyager enters, reveal cards from the top of your library until you reveal two land cards. Put those land cards onto the battlefield tapped and the rest on the bottom of your library in a random order.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "U.S.S. Voyager, Lone Wanderer",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying, vigilance`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until-count",
        filter: { type: "land" },
        count: 2,
        put: "battlefield",
        tapped: true,
        rest: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["flying", "vigilance"],
      text: "8+ | Flying, vigilance",
    }),
  ],
});
