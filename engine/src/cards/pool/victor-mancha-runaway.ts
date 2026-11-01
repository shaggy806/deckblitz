import { defineCard } from "../define.js";

// As Lightning, Security Sergeant's permission, over a card from the graveyard;
// "play" takes a land too (rule 305.1).
const TEXT =
  "When Victor Mancha enters, exile target card from your graveyard. You may play it for as long as you control Victor Mancha.";

export default defineCard({
  name: "Victor Mancha, Runaway",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      effect: { kind: "exile", target: 0, mayCast: { duration: "while-you-control", play: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
