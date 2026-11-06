import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 30070.

const RETURN_TEXT =
  "Whenever U.S.S. Reliant enters or deals combat damage to a player, return target creature card with mana value 4 or less from your graveyard to the battlefield with a finality counter on it.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 10+.)";

const TARGET: TargetSpec = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { type: "creature", manaValue: { op: "lte", n: 4 } },
};
const RETURN: EffectSpec = { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } };

export default defineCard({
  name: "U.S.S. Reliant, From Hell's Heart",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 4,
  toughness: 3,
  text: `${RETURN_TEXT}\n${STATION_TEXT}\n10+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [TARGET],
      effect: RETURN,
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
  static: [
    stationBand(10, {
      addTypes: ["creature"],
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["flying"],
      text: "10+ | Flying",
    }),
  ],
});
