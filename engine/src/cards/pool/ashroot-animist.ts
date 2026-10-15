import { defineCard } from "../define.js";

// EDHREC rank 9251.
//
// Rulings:
//   [2024-11-08] The value of X is determined only once, as Ashroot Animist's last ability
//     resolves. The value of the bonus won't change later in the turn if Ashroot Animist's power
//     changes.
//   [2024-11-08] If Ashroot Animist leaves the battlefield before its last ability resolves, use
//     its power as it last existed on the battlefield to determine the value of X.

const ATTACK_TEXT =
  "Whenever this creature attacks, another target creature you control gains trample and gets +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Ashroot Animist",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Druid"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "modify-pt",
            target: 0,
            power: { powerOf: "source" },
            toughness: { powerOf: "source" },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
