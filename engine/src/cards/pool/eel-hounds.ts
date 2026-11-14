import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, another target creature you control gets +2/+2 and gains trample until end of turn.";

export default defineCard({
  name: "Eel-Hounds",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fish", "Dog"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player it's attacking.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
