import { defineCard } from "../define.js";

// EDHREC rank 24841. "Becomes a Dinosaur Hero" with no "in addition" replaces
// its creature types (rule 205.1b); the base P/T is set in layer 7b, so
// counters and pumps still apply on top, the later activation's base P/T
// wins by timestamp, and the keywords from both stay.
const BRONTO_TEXT =
  "Brontosaurus — {3}: Until end of turn, Reptil becomes a Dinosaur Hero with base power and toughness 3/5 and gains reach and vigilance.";
const TREX_TEXT =
  "Tyrannosaurus Rex — {6}: Until end of turn, Reptil becomes a Dinosaur Hero with base power and toughness 6/6 and gains trample.";

export default defineCard({
  name: "Reptil, Dinomorpher",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 1,
  toughness: 2,
  text: `${BRONTO_TEXT}\n${TREX_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Dinosaur", "Hero"],
        keywords: ["reach", "vigilance"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: BRONTO_TEXT,
    },
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 6,
        toughness: 6,
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Dinosaur", "Hero"],
        keywords: ["trample"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TREX_TEXT,
    },
  ],
});
