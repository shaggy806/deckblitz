import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 13319.
//
// The return isn't targeted and isn't a "may": a creature or Spacecraft card
// in the graveyard after the mill (one milled or one already there) must be
// chosen, and with none there nothing happens.

const ENTER_TEXT =
  "When this Spacecraft enters, mill three cards, then return a creature or Spacecraft card from your graveyard to your hand.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "Fell Gravship",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n8+ | Flying, lifelink`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 2 },
      grantKeywords: ["flying", "lifelink"],
      text: "8+ | Flying, lifelink",
    }),
  ],
});
