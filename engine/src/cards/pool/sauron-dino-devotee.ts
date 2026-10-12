import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 18552. Marvel Super Heroes Commander.
//
// "Enters or attacks" is two triggers with one modal effect, its mode chosen
// as it's put on the stack (rule 700.2b — Avengers Quinjet's shape). "It's a
// green Dinosaur with base power and toughness 5/5" sets its colour and
// replaces its creature types (rule 205.1a — Turn to Frog's `setSubtypes`),
// for as long as it has a saurian counter on it (rule 611.2b: nothing if the
// counter couldn't be put on it, and it ends as the last one is removed).
const TRIGGER_TEXT = "Whenever Sauron enters or attacks, choose one —";
const LIFE_MODE = "Cure Cancer — You gain 3 life.";
const DINO_MODE =
  "Turn People into Dinosaurs — Put a saurian counter on another target creature. It's a green Dinosaur with base power and toughness 5/5 for as long as it has a saurian counter on it.";

const MODES: EffectSpec = {
  kind: "modal",
  announced: true,
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: LIFE_MODE, effect: { kind: "gain-life", amount: 3 } },
    {
      text: DINO_MODE,
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "saurian", amount: 1 },
          {
            kind: "animate",
            target: 0,
            power: 5,
            toughness: 5,
            addTypes: [],
            addSubtypes: [],
            setSubtypes: ["Dinosaur"],
            setColors: ["G"],
            duration: { whileCounter: "saurian" },
          },
        ],
      },
    },
  ],
};

const TEXT = `${TRIGGER_TEXT} ${LIFE_MODE} ${DINO_MODE}`;

export default defineCard({
  name: "Sauron, Dino Devotee",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Vampire", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n• ${LIFE_MODE}\n• ${DINO_MODE}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: MODES, resolve: null, text: TEXT },
  ],
});
