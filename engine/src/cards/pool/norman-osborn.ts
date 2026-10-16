import { defineCard } from "../define.js";

export default defineCard({
  name: "Norman Osborn",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist", "Villain"],
  power: 1,
  toughness: 1,
  text: "Norman Osborn can't be blocked.\nWhenever Norman Osborn deals combat damage to a player, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\n{1}{U}{B}{R}: Transform Norman Osborn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}{U}{B}{R}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{1}{U}{B}{R}: Transform Norman Osborn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "Whenever Norman Osborn deals combat damage to a player, he connives.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "Norman Osborn can't be blocked.",
    },
  ],
  faces: ["Norman Osborn", "Green Goblin"],
});
