import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature must be blocked by exactly one creature if able.";
const COPY_TEXT =
  "Whenever this creature attacks, create X tokens that are copies of it and that are tapped and attacking, where X is the number of creatures defending player controls. Exile the tokens at the beginning of the next end step.";

export default defineCard({
  name: "Nacatl War-Pride",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${BLOCK_TEXT}\n${COPY_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "must-be-blocked-if-able", exactlyOne: true }], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "source",
        count: { countOf: { type: "creature", controlledBy: "you" }, forPlayer: "trigger-player" },
        who: "you",
        tapped: true,
        attacking: "choose",
        exileAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
