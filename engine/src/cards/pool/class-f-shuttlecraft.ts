import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 26038.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "Class-F Shuttlecraft",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 2,
  toughness: 4,
  text: `{T}: Add one mana of any color.\n${STATION_TEXT}\n6+ | Flying, vigilance`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    station(STATION_TEXT),
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 2, toughness: 4 },
      grantKeywords: ["flying", "vigilance"],
      text: "6+ | Flying, vigilance",
    }),
  ],
});
