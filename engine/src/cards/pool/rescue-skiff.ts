import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 12136.
//
// Rulings:
//   [2025-07-25] If an Aura is put onto the battlefield without being cast, the Aura’s
//     controller-to-be chooses what it will enchant as it comes back onto the battlefield. An Aura
//     put onto the battlefield this way doesn’t target anything (so it could be attached to an
//     opponent’s permanent with hexproof, for example), but the Aura’s enchant ability restricts
//     what it can be attached to. If the Aura can’t legally be attached to anything, it remains in
//     its current zone.

const ENTER_TEXT =
  "When this Spacecraft enters, return target creature or enchantment card from your graveyard to the battlefield.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 10+.)";

// An Aura returned this way is asked what it enchants as it enters (rule
// 303.4f — `askEnterChoice`), and stays in the graveyard with nothing to
// enchant (the ruling).
export default defineCard({
  name: "Rescue Skiff",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 5,
  toughness: 6,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n10+ | Flying`,
  activated: [station(STATION_TEXT)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "enchantment"] } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    stationBand(10, {
      addTypes: ["creature"],
      setBasePt: { power: 5, toughness: 6 },
      grantKeywords: ["flying"],
      text: "10+ | Flying",
    }),
  ],
});
