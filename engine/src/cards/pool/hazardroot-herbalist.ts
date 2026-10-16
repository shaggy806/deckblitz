import { defineCard } from "../define.js";

// EDHREC rank 13940. Haunted Hellride's "whenever you attack" with Yip Yip!'s
// conditional rider: the deathtouch only if the target is a token as the
// ability resolves.
const TEXT =
  "Whenever you attack, target creature you control gets +1/+0 until end of turn. If that creature is a token, it also gains deathtouch until end of turn.";

export default defineCard({
  name: "Hazardroot Herbalist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rabbit", "Druid"],
  power: 1,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { token: true } },
            then: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
