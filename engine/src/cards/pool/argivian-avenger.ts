import { defineCard } from "../define.js";

// The Brothers' War. "Your choice of" isn't a modal ability (rule 700.2): the
// keyword is chosen as the ability resolves — a resolution-time `modal`, as
// Assassin Initiate's — after the -1/-1.
const PUMP_TEXT =
  "{1}: Until end of turn, this creature gets -1/-1 and gains your choice of flying, vigilance, deathtouch, or haste.";

export default defineCard({
  name: "Argivian Avenger",
  manaCost: "{6}",
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 5,
  toughness: 5,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: -1, toughness: -1, duration: "end-of-turn" },
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Flying", effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" } },
              { text: "Vigilance", effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" } },
              { text: "Deathtouch", effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" } },
              { text: "Haste", effect: { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" } },
            ],
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
