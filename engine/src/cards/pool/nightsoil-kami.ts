import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27875.

export default defineCard({
  name: "Nightsoil Kami",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 6,
  toughness: 4,
  text: "Soulshift 5 (When this creature dies, you may return target Spirit card with mana value 5 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 5 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 5 (When this creature dies, you may return target Spirit card with mana value 5 or less from your graveyard to your hand.)",
    },
  ],
});
