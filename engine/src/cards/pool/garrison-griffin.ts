import { defineCard } from "../define.js";

// EDHREC rank 26629. Throne of Eldraine.

export default defineCard({
  name: "Garrison Griffin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, target Knight you control gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Knight" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, target Knight you control gains flying until end of turn.",
    },
  ],
});
