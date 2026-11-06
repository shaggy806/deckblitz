import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 18343.

const EXILE_TEXT =
  "When Deep Space 9 enters and at the beginning of your upkeep, exile the top four cards of your library. " +
  "Put all permanent cards exiled this way onto the battlefield.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery.)";

// The nonpermanent cards stay in exile. Deep Space 9 has no P/T and no
// creature band: it never becomes a creature.
const EXILE_AND_PUT: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile-from-library", amount: 4 },
    {
      kind: "put-exiled-this-way-onto-battlefield",
      filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
    },
  ],
};

export default defineCard({
  name: "Deep Space 9",
  manaCost: "{9}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  text: `${EXILE_TEXT}\n${STATION_TEXT}\n9+ | Creatures you control get +3/+3.`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: EXILE_AND_PUT,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: EXILE_AND_PUT,
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    stationBand(
      9,
      { grantPt: [3, 3], text: "9+ | Creatures you control get +3/+3." },
      { scope: "creatures-you-control" },
    ),
  ],
});
