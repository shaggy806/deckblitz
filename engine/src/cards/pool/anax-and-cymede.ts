import { defineCard } from "../define.js";

// EDHREC rank 15563. Heroic as Hero of the Games has it; only creatures you
// control as it resolves get the bonus (the rulings).
const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets Anax and Cymede, creatures you control get +1/+1 and gain trample until end of turn.";

export default defineCard({
  name: "Anax and Cymede",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${HEROIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "trample",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
