import { defineCard } from "../define.js";

// EDHREC rank 15215.

export default defineCard({
  name: "The Howling Abomination",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Beast", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text: "Haste\nThe Howling Abomination has trample as long as you've cast three or more spells this turn.\nWhenever The Howling Abomination becomes the target of a spell, it gets +2/+2 until end of turn and deals 2 damage to each opponent.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 3 },
      grantKeywords: ["trample"],
      text: "The Howling Abomination has trample as long as you've cast three or more spells this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "damage", amount: 2, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: "Whenever The Howling Abomination becomes the target of a spell, it gets +2/+2 until end of turn and deals 2 damage to each opponent.",
    },
  ],
});
