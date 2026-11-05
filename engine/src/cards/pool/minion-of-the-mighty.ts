import { defineCard } from "../define.js";

const TEXT =
  "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, you may put a Dragon creature card from your hand onto the battlefield tapped and attacking.";

export default defineCard({
  name: "Minion of the Mighty",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kobold"],
  power: 0,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", subtype: "Dragon" },
        enterTapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
