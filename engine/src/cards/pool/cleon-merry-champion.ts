import { defineCard } from "../define.js";

// EDHREC rank 18602. Brigone's heroic trigger; Crimson Operative's exile,
// played with every cost and timing rule (the ruling).

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets Cleon, exile the top card of your library. You may play that card until the end of your next turn.";

export default defineCard({
  name: "Cleon, Merry Champion",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${HEROIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
