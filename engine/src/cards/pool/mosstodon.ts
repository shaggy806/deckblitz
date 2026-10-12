import { defineCard } from "../define.js";

export default defineCard({
  name: "Mosstodon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Elephant"],
  power: 5,
  toughness: 3,
  text: "{1}: Target creature with power 5 or greater gains trample until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: Target creature with power 5 or greater gains trample until end of turn.",
    },
  ],
});
