import { defineCard } from "../define.js";

// EDHREC rank 7788.

export default defineCard({
  name: "Caves of Chaos Adventurer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 5,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, you take the initiative.\nWhenever this creature attacks, exile the top card of your library. If you've completed a dungeon, you may play that card this turn without paying its mana cost. Otherwise, you may play that card this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "take-initiative" },
      resolve: null,
      text: "When this creature enters, you take the initiative.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "completed-dungeon" },
        // The only permission is the free one (no paying, so an X is 0).
        then: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", free: { only: true } },
        else: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: "Whenever this creature attacks, exile the top card of your library. If you've completed a dungeon, you may play that card this turn without paying its mana cost. Otherwise, you may play that card this turn.",
    },
  ],
});
