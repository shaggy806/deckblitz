import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Living Laser attacks, for each card you've discarded this turn, create a token that's a copy of Living Laser, except the token isn't legendary. The tokens enter tapped and attacking. Exile the tokens at the beginning of the next end step.";

export default defineCard({
  name: "Living Laser",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "source",
        count: { turnHistory: "discarded" },
        who: "you",
        tapped: true,
        attacking: "choose",
        exileAtEndStep: true, exceptions: { removeSupertypes: ["legendary"] },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
