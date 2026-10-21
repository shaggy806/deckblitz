import { defineCard } from "../define.js";

// EDHREC rank 26323.

const CAST_TEXT =
  "Whenever you cast a spell, if that spell was kicked, this creature gets +1/+1 and gains menace until end of turn. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Bloodstone Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: CAST_TEXT,
  triggered: [
    {
      // A spell's kicked status is fixed once it's cast, so the
      // intervening-if can't turn false before this resolves.
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
