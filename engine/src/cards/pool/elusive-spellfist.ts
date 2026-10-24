import { defineCard } from "../define.js";

// EDHREC rank 19306. TVA Bureaucrat's shape.
const CAST_TEXT =
  "Whenever you cast a noncreature spell, this creature gets +1/+0 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Elusive Spellfist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 3,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
