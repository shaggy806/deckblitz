import { defineCard } from "../define.js";

// EDHREC rank 31128.

const ATTACK_TEXT =
  "Whenever you attack, you may sacrifice another creature. If you do, draw a card, then Klingons and Warriors " +
  "you control get +2/+2 until end of turn.";

export default defineCard({
  name: "Kor, Cause of Vengeance",
  manaCost: "{1}{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 4,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "modify-pt-all",
              filter: { type: "creature", subtypes: ["Klingon", "Warrior"], controlledBy: "you" },
              power: 2,
              toughness: 2,
              duration: "end-of-turn",
            },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
