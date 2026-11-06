import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT =
  "Seek out — Whenever you draw your second card each turn, one or two target creatures each get +2/+0 and gain lifelink until end of turn.";

export default defineCard({
  name: "Vic Fontaine, One Night Only",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Performer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
