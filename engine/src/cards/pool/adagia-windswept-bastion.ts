import { defineCard } from "../define.js";
import { entersTappedStatic, manaTapAbility, station, stationBand } from "../helpers.js";

// A token copy of an Aura is asked what it enchants as it enters (rule
// 303.4f, the ruling); a nonlegendary original stays as it is, beside a
// legendary token.

const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Planet. Station only as a sorcery.)";
const COPY_TEXT =
  "{3}{W}, {T}: Create a token that's a copy of target artifact or enchantment you control, except it's legendary. Activate only as a sorcery.";

export default defineCard({
  name: "Adagia, Windswept Bastion",
  colors: [],
  types: ["land"],
  subtypes: ["Planet"],
  text: `This land enters tapped.\n{T}: Add {W}.\n${STATION_TEXT}\n12+ | ${COPY_TEXT}`,
  static: [
    entersTappedStatic("Adagia, Windswept Bastion"),
    stationBand(12, {
      grantsActivated: [
        {
          cost: { mana: "{3}{W}", tap: true },
          sorcerySpeed: true,
          targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
          effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { addSupertypes: ["legendary"] } },
          resolve: null,
          text: COPY_TEXT,
        },
      ],
      text: `12+ | ${COPY_TEXT}`,
    }),
  ],
  activated: [manaTapAbility("W"), station(STATION_TEXT)],
});
