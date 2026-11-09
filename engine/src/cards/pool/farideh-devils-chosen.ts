import { defineCard } from "../define.js";

const TEXT =
  "Dark One's Own Luck — Whenever you roll one or more dice, Farideh gains flying and menace until end of turn. If any " +
  "of those results was 10 or higher, draw a card.";

export default defineCard({
  name: "Farideh, Devil's Chosen",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Tiefling", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "rolls-dice", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "amounts", left: { roll: { atLeast: 10 } }, op: "gte", right: 1 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
