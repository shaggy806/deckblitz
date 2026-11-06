import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 26929.

export default defineCard({
  name: "Davvol, Evincar of Rath",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Noble"],
  power: 2,
  toughness: 2,
  text: "Whenever another creature you control enters, you lose 1 life and add {B}.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1 }, { kind: "add-mana", mana: "B", amount: 1 }],
      },
      resolve: null,
      text: "Whenever another creature you control enters, you lose 1 life and add {B}.",
    },
  ],
});
