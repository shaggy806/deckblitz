import { defineCard } from "../define.js";

// EDHREC rank 11686.
// "Up to two target creatures" — any creatures, not only yours — is one
// "any number" group capped at two (Zimone, Paradox Sculptor's shape).

export default defineCard({
  name: "Agent Bishop, Man in Black",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "At the beginning of combat on your turn, put a +1/+1 counter on each of up to two target creatures.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "any-number", of: "creature", max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "At the beginning of combat on your turn, put a +1/+1 counter on each of up to two target creatures.",
    },
  ],
});
