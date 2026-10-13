import { defineCard } from "../define.js";

// EDHREC rank 7159.
// Makes Eldrazi Spawn → "Eldrazi Spawn Token".
//
// Devoid: colourless in every zone (`colors: []`); its colour identity is
// still red and green, read from the mana cost. The cast trigger resolves
// before the spell, and still does if the spell is countered (the ruling).

const CAST_TEXT =
  'When you cast this spell, create two 0/1 colorless Eldrazi Spawn creature tokens with "Sacrifice this token: Add {C}."';
const GROW_TEXT = "Whenever you sacrifice another Eldrazi, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Writhing Chrysalis",
  manaCost: "{2}{R}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: `Devoid (This card has no color.)\n${CAST_TEXT}\nReach\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 2 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Eldrazi" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
