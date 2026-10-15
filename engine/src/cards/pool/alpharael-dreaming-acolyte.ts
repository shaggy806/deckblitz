import { defineCard } from "../define.js";

// Rulings:
//   As Alpharael's first ability resolves, you can discard either one artifact
//   card or two cards which may or may not be artifacts (the discard's
//   `unlessOne` — Thirst for Identity's shape).

const ENTER_TEXT = "When Alpharael enters, draw two cards. Then discard two cards unless you discard an artifact card.";
const DEATHTOUCH_TEXT = "During your turn, Alpharael has deathtouch.";

export default defineCard({
  name: "Alpharael, Dreaming Acolyte",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${ENTER_TEXT}\n${DEATHTOUCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2, unlessOne: { type: "artifact" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
  ],
});
