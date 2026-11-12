import { defineCard } from "../define.js";

// EDHREC rank 15370.

export default defineCard({
  name: "Zuko, Seeking Honor",
  manaCost: "{2}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 2,
  text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)\nWhenever you cast a noncreature spell, Zuko gains first strike until end of turn.\nWhenever Zuko deals combat damage to a player, put a +1/+1 counter on him.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, untilEndOfCombat: true },
      resolve: null,
      firebending: true,
      text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)",
    },
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, Zuko gains first strike until end of turn.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever Zuko deals combat damage to a player, put a +1/+1 counter on him.",
    },
  ],
});
