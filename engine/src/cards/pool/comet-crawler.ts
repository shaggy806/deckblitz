import { defineCard } from "../define.js";

// EDHREC rank 18136. Beetle-Headed Merchants' optional sacrifice.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature or artifact. If you do, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Comet Crawler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 2,
  toughness: 3,
  keywords: ["lifelink"],
  text: `Lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
