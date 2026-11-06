import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// Star Trek Commander (TRC).

const ETB_TEXT = "When U.S.S. Defiant enters, destroy up to one target artifact or enchantment.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 5+.)";

export default defineCard({
  name: "U.S.S. Defiant, Tough Little Ship",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 7,
  toughness: 4,
  text: `${ETB_TEXT}\n${STATION_TEXT}\n5+ | Flying, hexproof`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact-or-enchantment" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(5, {
      addTypes: ["creature"],
      setBasePt: { power: 7, toughness: 4 },
      grantKeywords: ["flying", "hexproof"],
      text: "5+ | Flying, hexproof",
    }),
  ],
});
