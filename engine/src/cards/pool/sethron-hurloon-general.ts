import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const ENTER_TEXT = "Whenever Sethron or another nontoken Minotaur you control enters, create a 2/3 red Minotaur creature token.";
const PUMP_TEXT = "{2}{B/R}: Minotaurs you control get +1/+0 and gain menace and haste until end of turn.";
const MINOTAURS = { type: "creature", subtype: "Minotaur", controlledBy: "you" } as const;

export default defineCard({
  name: "Sethron, Hurloon General",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${PUMP_TEXT} ({B/R} can be paid with either {B} or {R}.)`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", subtype: "Minotaur", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Minotaur Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    }),
  ],
  activated: [
    {
      cost: { mana: "{2}{B/R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: MINOTAURS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: MINOTAURS, keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: MINOTAURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
