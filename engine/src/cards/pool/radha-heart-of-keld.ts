import { defineCard } from "../define.js";

const FIRST_STRIKE_TEXT = "During your turn, Radha has first strike.";
const TOP_TEXT =
  "You may look at the top card of your library any time, and you may play lands from the top of your library.";
const PUMP_TEXT = "{4}{R}{G}: Radha gets +X/+X until end of turn, where X is the number of lands you control.";
const LANDS = { countOf: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "Radha, Heart of Keld",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${FIRST_STRIKE_TEXT}\n${TOP_TEXT}\n${PUMP_TEXT}`,
  looksAtOwnLibraryTop: true,
  activated: [
    {
      cost: { mana: "{4}{R}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: LANDS, toughness: LANDS, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: FIRST_STRIKE_TEXT,
    },
    {
      affects: { scope: "self" },
      playFromLibraryTop: { type: "land" },
      text: TOP_TEXT,
    },
  ],
});
