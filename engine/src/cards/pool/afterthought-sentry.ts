import { defineCard } from "../define.js";

// EDHREC rank 29675.

export default defineCard({
  name: "Afterthought Sentry",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  text: "{2}: This creature gains flying until end of turn.\nWhenever this creature attacks, exile up to one target card from a graveyard.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: This creature gains flying until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, exile up to one target card from a graveyard.",
    },
  ],
});
