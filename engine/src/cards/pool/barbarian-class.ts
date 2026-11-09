import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

// EDHREC rank 4116. A Class (rule 716): see `artificer-class.ts`.
const REPLACE_TEXT = "If you would roll one or more dice, instead roll that many dice plus one and ignore the lowest roll.";
const PUMP_TEXT = "Whenever you roll one or more dice, target creature you control gets +2/+0 and gains menace until end of turn.";
const HASTE_TEXT = "Creatures you control have haste.";

export default defineCard({
  name: "Barbarian Class",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${REPLACE_TEXT}\n{1}{R}: Level 2\n${PUMP_TEXT}\n{2}{R}: Level 3\n${HASTE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-roll-dice", who: "you", instead: { modify: { plus: 1 } }, ignoreLowest: true },
      text: REPLACE_TEXT,
    },
    atLevel(3, { affects: { scope: "creatures-you-control" }, grantKeywords: ["haste"], text: HASTE_TEXT }),
  ],
  triggered: [
    atLevel(2, {
      trigger: { on: "event", event: "rolls-dice", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    }),
  ],
  activated: [classLevel(2, "{1}{R}"), classLevel(3, "{2}{R}")],
});
