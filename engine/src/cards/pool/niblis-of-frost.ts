import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 8209.
//
// Rulings:
//   [2016-07-13] If multiple effects say that a creature doesn't untap during its controller's
//     next untap step, those effects all apply during one untap step.
const PROWESS_TEXT =
  "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const TAP_TEXT =
  "Whenever you cast an instant or sorcery spell, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Niblis of Frost",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PROWESS_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
