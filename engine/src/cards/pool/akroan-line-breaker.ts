import { defineCard } from "../define.js";

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, this creature gets +2/+0 and gains intimidate until end of turn. (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)";

export default defineCard({
  name: "Akroan Line Breaker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "intimidate", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
