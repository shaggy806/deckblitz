import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, another target attacking Knight gains menace until end of turn.";

export default defineCard({
  name: "Ogre Errant",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Knight"],
  power: 3,
  toughness: 4,
  text: `${TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        { kind: "other", of: { kind: "permanent", filter: { type: "creature", subtype: "Knight", attacking: true } } },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
