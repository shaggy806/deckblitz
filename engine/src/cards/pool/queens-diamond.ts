import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

const MANA_TEXT =
  "{T}: Choose a color. Add one mana of that color for each charge counter on Queen's Diamond. Spend this mana only to cast your commander.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";

export default defineCard({
  name: "Queen's Diamond",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 5,
  text: `${MANA_TEXT}\n${STATION_TEXT}\n8+ | Flying, vigilance, haste`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { countersOn: "source", counter: "charge" },
        spendOnly: {
          spell: { isCommander: true, ownedBy: "you" },
          text: "Spend this mana only to cast your commander.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    station(STATION_TEXT),
  ],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["flying", "vigilance", "haste"],
      text: "8+ | Flying, vigilance, haste",
    }),
  ],
});
