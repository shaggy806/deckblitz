import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 18170. Two bonuses over the
// attacking creatures as it resolves (rule 611.2c), so one both red and white
// gets +2/+2 (the ruling).
const TEXT =
  "Whenever Agrus Kos attacks, attacking red creatures get +2/+0 and attacking white creatures get +0/+2 until end of turn.";

export default defineCard({
  name: "Agrus Kos, Wojek Veteran",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", attacking: true, colors: ["R"] },
            power: 2,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", attacking: true, colors: ["W"] },
            power: 0,
            toughness: 2,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
