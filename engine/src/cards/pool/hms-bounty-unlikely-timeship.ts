import { defineCard } from "../define.js";
import { station, stationBand } from "../helpers.js";

// EDHREC rank 27768.

const ENTER_TEXT =
  "When H.M.S. Bounty enters, you may search your library for a Whale card, reveal it, put it into your hand, then shuffle.";
const STATION_TEXT =
  "Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. " +
  "Station only as a sorcery. It's an artifact creature at 8+.)";
const BAND_TEXT = "8+ | Flying";
const DAMAGE_TEXT =
  "Whenever H.M.S. Bounty deals combat damage to a player, draw a card. If you control a Whale and haven't begun an extra turn this game, take an extra turn after this one.";

// "Haven't begun an extra turn this game" reads the journal's whole-game
// count of your extra turns that began (rule 500.7): one queued but not yet
// begun doesn't count, and a skipped one never began (614.10).
export default defineCard({
  name: "H.M.S. Bounty, Unlikely Timeship",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Spacecraft"],
  power: 3,
  toughness: 4,
  text: `${ENTER_TEXT}\n${STATION_TEXT}\n${BAND_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Whale card?",
        effect: { kind: "search-library", filter: { subtype: "Whale" }, destination: "hand", min: 0, max: 1, reveal: true },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "controls", filter: { subtype: "Whale" }, atLeast: 1 },
                {
                  kind: "not",
                  of: { kind: "turn-history", what: "extra-turn-began", who: "you", window: "this-game", atLeast: 1 },
                },
              ],
            },
            then: { kind: "take-extra-turn" },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [station(STATION_TEXT)],
  static: [
    stationBand(8, {
      addTypes: ["creature"],
      setBasePt: { power: 3, toughness: 4 },
      grantKeywords: ["flying"],
      text: BAND_TEXT,
    }),
  ],
});
