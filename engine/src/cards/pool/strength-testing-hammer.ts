import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// "That creature" and "it" are the creature that attacked, wherever the
// Equipment has gone since, read as it last existed if it has left (rule 608.2h).
const TEXT =
  "Whenever equipped creature attacks, roll a six-sided die. That creature gets +X/+0 until end of turn, where X is the result. Then if it has the greatest power or is tied for greatest power among creatures on the battlefield, draw a card.";

export default defineCard({
  name: "Strength-Testing Hammer",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt",
              target: "trigger-object",
              power: { roll: "total" },
              toughness: 0,
              duration: "end-of-turn",
            },
            {
              kind: "conditional",
              condition: {
                kind: "trigger-object",
                filter: { greatestInZone: { of: "power", among: { type: "creature" } } },
              },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [equip("{3}")],
});
