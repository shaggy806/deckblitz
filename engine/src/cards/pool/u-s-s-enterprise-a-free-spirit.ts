import { defineCard } from "../define.js";
import { station, stationBand, ward } from "../helpers.js";

// EDHREC rank 23448.

const ENTER_TEXT = "When U.S.S. Enterprise-A enters, create three 1/1 red Officer creature tokens.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 6+.)";

export default defineCard({
  name: "U.S.S. Enterprise-A, Free Spirit",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `Ward {2}\n${ENTER_TEXT}\n${STATION_TEXT}\n6+ | Flying, lifelink`,
  activated: [station(STATION_TEXT)],
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(6, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying", "lifelink"],
      text: "6+ | Flying, lifelink",
    }),
  ],
});
