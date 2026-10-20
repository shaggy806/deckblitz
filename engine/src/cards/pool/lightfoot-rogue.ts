import { defineCard } from "../define.js";

// EDHREC rank 7506. A results table (rule 706.3a); "Sneak Attack" is an ability word.
const TEXT =
  "Sneak Attack — Whenever this creature attacks, roll a d20.\n1—9 | This creature gains deathtouch until end of turn.\n10—19 | It gets +1/+0 and gains deathtouch until end of turn.\n20 | It gets +3/+0 and gains first strike and deathtouch until end of turn.";

export default defineCard({
  name: "Lightfoot Rogue",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Halfling", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          {
            min: 1,
            max: 9,
            effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
          },
          {
            min: 10,
            max: 19,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
              ],
            },
          },
          {
            min: 20,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: "source", power: 3, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
                { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
