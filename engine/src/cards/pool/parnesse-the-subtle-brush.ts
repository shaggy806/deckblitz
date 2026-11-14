import { defineCard } from "../define.js";

// EDHREC rank 17052. "Whenever you copy a spell": a copy you make, never one
// you cast (rule 707.10); the opponent's copy is theirs, so it doesn't
// trigger this again.

const WARD_TEXT =
  "Whenever you or a permanent you control becomes the target of a spell or ability an opponent controls, counter that spell or ability unless that player pays 4 life.";
const COPY_TEXT =
  "Whenever you copy a spell, up to one target opponent may also copy that spell. They may choose new targets for that copy.";

export default defineCard({
  name: "Parnesse, the Subtle Brush",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${WARD_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 4 } },
      resolve: null,
      text: WARD_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", copyOnly: true },
      targets: [{ kind: "optional", of: "opponent" }],
      effect: {
        kind: "each-player-may",
        who: { target: 0 },
        prompt: "Copy that spell? (You may choose new targets for the copy.)",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
