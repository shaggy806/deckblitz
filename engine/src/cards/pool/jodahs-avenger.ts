import { defineCard } from "../define.js";

// EDHREC rank 23506.

const PUMP_TEXT =
  "{0}: Until end of turn, this creature gets -1/-1 and gains your choice of double strike, protection from red, vigilance, or shadow.";

export default defineCard({
  name: "Jodah's Avenger",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  text: `${PUMP_TEXT} (A creature with shadow can block or be blocked by only creatures with shadow.)`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
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
              { text: "Double strike", effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" } },
              { text: "Protection from red", effect: { kind: "grant-protection", target: "source", from: { colors: ["R"] }, duration: "end-of-turn" } },
              { text: "Vigilance", effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" } },
              { text: "Shadow", effect: { kind: "grant-keyword", target: "source", keyword: "shadow", duration: "end-of-turn" } },
            ],
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
