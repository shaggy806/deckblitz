import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 7603.
//
// Springbloom Druid's shape: the sacrifice is chosen as it resolves, and the
// search happens only if something was sacrificed. A Lander is an artifact
// subtype, so "a land or Lander" is either.

const ETB_TEXT =
  "When this Spacecraft enters, you may sacrifice a land or Lander. If you do, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";

export default defineCard({
  name: "Larval Scoutlander",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${STATION_TEXT}\n7+ | Flying`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice a land or Lander to search for up to two basic lands?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "sacrifice",
              who: "you",
              filter: { anyOf: [{ type: "land" }, { subtype: "Lander" }] },
              count: 1,
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
              then: {
                kind: "search-library",
                filter: { type: "land", supertype: "basic" },
                destination: "battlefield",
                min: 0,
                max: 2,
                enterTapped: true,
              },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 3 },
      grantKeywords: ["flying"],
      text: "7+ | Flying",
    }),
  ],
});
