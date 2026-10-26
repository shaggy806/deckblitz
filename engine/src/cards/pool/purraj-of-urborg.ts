import { defineCard } from "../define.js";

export default defineCard({
  name: "Purraj of Urborg",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 2,
  toughness: 3,
  text: "Purraj has first strike as long as it's attacking.\nWhenever a player casts a black spell, you may pay {B}. If you do, put a +1/+1 counter on Purraj.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["first-strike"],
      text: "Purraj has first strike as long as it's attacking.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["B"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to put a +1/+1 counter on Purraj?",
        cost: "{B}",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: "Whenever a player casts a black spell, you may pay {B}. If you do, put a +1/+1 counter on Purraj.",
    },
  ],
});
