import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23792.

export default defineCard({
  name: "Forked-Branch Garami",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: "Soulshift 4, soulshift 4 (When this creature dies, you may return up to two target Spirit cards with mana value 4 or less from your graveyard to your hand.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { subtype: "Spirit", manaValue: { op: "lte", n: 4 } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the target Spirit card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "Soulshift 4 (When this creature dies, you may return target Spirit card with mana value 4 or less from your graveyard to your hand.)",
    },
  ],
});
