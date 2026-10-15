import { defineCard } from "../define.js";

// EDHREC rank 16705.
//
// Echo, Perceptive Prodigy's shape, from an artifact source: "during your
// turn" is the activation's `your-turn` condition (rule 602.5) and "only once
// each turn" its `oncePerTurn`, both checked as it's activated.
const COPY_TEXT =
  "Pay 2 life: Copy target activated or triggered ability you control from an artifact source. You may choose new targets for the copy. Activate only during your turn and only once each turn.";

export default defineCard({
  name: "Scientist Supreme of A.I.M.",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 2,
  toughness: 2,
  text: `${COPY_TEXT} (Mana abilities can't be targeted.)`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 2 },
      targets: [{ kind: "ability", whose: "you", sourceTypes: ["artifact"] }],
      effect: { kind: "copy-ability", target: 0, newTargets: true },
      resolve: null,
      condition: { kind: "your-turn" },
      oncePerTurn: true,
      text: COPY_TEXT,
    },
  ],
});
