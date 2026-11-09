import { defineCard } from "../define.js";

// EDHREC rank 31407.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a token that's a copy of target creature you control, except it isn't legendary. It gains haste until end of turn. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Gray and Adira, Forever Joined",
  manaCost: "{2}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Trill", "Human", "Officer"],
  power: 2,
  toughness: 3,
  text: COMBAT_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: ["creature-you-control"],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        gainUntilEndOfTurn: ["haste"],
        sacrificeAtEndStep: true, exceptions: { removeSupertypes: ["legendary"] },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
