import { defineCard } from "../define.js";

// EDHREC rank 14339. Marvel Super Heroes Commander.
//
// "Do this only once each turn" limits the copying, not the trigger: a
// turn when it was declined doesn't count, so a later noncreature spell
// that turn may still be copied (`may`'s `oncePerTurn`). A copy of a
// permanent spell becomes a token (rule 608.3f).

const MANA_TEXT = "At the beginning of your first main phase, add four mana in any combination of colors.";
const COPY_TEXT =
  "Whenever you cast a noncreature spell, you may copy it. You may choose new targets for the copy. Do this only once each turn. (A copy of a permanent spell becomes a token.)";

export default defineCard({
  name: "Cosmic Crucible",
  manaCost: "{4}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: `${MANA_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 4 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Copy that spell?",
        oncePerTurn: true,
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
