import { defineCard } from "../define.js";

// EDHREC rank 14200.
// Dictate of Karametra's trigger, narrowed to lands with one of the three
// basic land types.

const TEXT = "Whenever a player taps a Mountain, Forest, or Plains for mana, that player adds one mana of any type that land produced.";

export default defineCard({
  name: "Keeper of Progenitus",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "tapped-for-mana",
        who: "any",
        filter: { type: "land", anyOf: [{ subtype: "Mountain" }, { subtype: "Forest" }, { subtype: "Plains" }] },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "produced", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
