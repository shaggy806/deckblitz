import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, exile another target creature or artifact until this creature leaves the battlefield. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.";

export default defineCard({
  name: "Hostage Taker",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // Nothing is exiled if it has already left (rule 610.3a); a token
      // exiled ceases to exist, so there's nothing to cast or return.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { typesAnyOf: ["creature", "artifact"] } } }],
      effect: {
        kind: "exile",
        target: 0,
        untilSourceLeaves: true,
        mayCast: { duration: "while-exiled", spendAs: "any-type" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
