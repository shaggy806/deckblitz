import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 24750.

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, you may put a creature card from your hand onto the battlefield. That creature gains haste. At the beginning of the next end step, put it on the bottom of your library. When you do, draw a card.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 7+.)";
const BAND_TEXT = "7+ | Flying";
const BOTTOM_TEXT = "Put it on the bottom of your library. When you do, draw a card.";

// The end step's ability acts on that creature only while it's the same
// object (rule 603.7c); "when you do" is a reflexive trigger (603.12),
// only if it went to the bottom.
export default defineCard({
  name: "U.S.S. Farragut, Bold Explorer",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 4,
  text: `${LANDFALL_TEXT}\n${STATION_TEXT}\n${BAND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "permanent" },
            {
              kind: "delayed-trigger",
              at: { step: "end" },
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "put-on-bottom-of-library", target: 0 },
                  {
                    kind: "conditional",
                    condition: { kind: "this-way", what: "put-on-bottom", atLeast: 1 },
                    then: {
                      kind: "reflexive-trigger",
                      targets: [],
                      effect: { kind: "draw", amount: 1 },
                      text: "When you do, draw a card.",
                    },
                  },
                ],
              },
              text: BOTTOM_TEXT,
            },
          ],
        },
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(7, { addTypes: ["creature"], setBasePt: { power: 4, toughness: 4 }, grantKeywords: ["flying"], text: BAND_TEXT }),
  ],
});
