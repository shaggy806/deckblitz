import { defineCard } from "../define.js";

// EDHREC rank 17575. Blessed Hippogriff's attack trigger.

export default defineCard({
  name: "Trusted Pegasus",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nWhenever this creature attacks, target attacking creature without flying gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target attacking creature without flying gains flying until end of turn.",
    },
  ],
});
