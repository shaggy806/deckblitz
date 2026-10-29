import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 29636.

export default defineCard({
  name: "Bolrac-Clan Crusher",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 4,
  toughness: 4,
  text: "{T}, Remove a +1/+1 counter from a creature you control: This creature deals 2 damage to any target.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{T}, Remove a +1/+1 counter from a creature you control: This creature deals 2 damage to any target.",
    },
  ],
});
