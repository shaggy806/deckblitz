import { defineCard } from "../define.js";

// EDHREC rank 14105. "One or more cards leave your graveyard" is the batched
// `leaves-graveyard` trigger (Hardened Academic): once per batch (the ruling).

const PREPARE_TEXT = "Whenever one or more cards leave your graveyard, Kirol becomes prepared.";

export default defineCard({
  name: "Kirol, History Buff",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 2,
  toughness: 3,
  text: `${PREPARE_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: PREPARE_TEXT,
    },
  ],
  prepareSpell: "Pack a Punch",
});
