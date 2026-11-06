import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27713.
// Makes Forest Dryad → use "Forest Dryad Token".

export default defineCard({
  name: "Autumn Willow, Harmony",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 3,
  keywords: ["hexproof"],
  text: "Hexproof\nWhen Autumn Willow enters, create a 1/1 green Forest Dryad land creature token. (It's affected by summoning sickness.)\nWhenever you tap a land creature for mana, add an additional {G}.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Forest Dryad Token", count: 1 },
      resolve: null,
      text: "When Autumn Willow enters, create a 1/1 green Forest Dryad land creature token.",
    },
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { types: ["land", "creature"] } },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "Whenever you tap a land creature for mana, add an additional {G}.",
    },
  ],
});
