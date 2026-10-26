import { defineCard } from "../define.js";

// "Has base power and toughness 3/3" is a layer-7b `animate` with no new
// types, as Brokers Initiate.
export default defineCard({
  name: "Marsh Flitter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create two 1/1 black Goblin Rogue creature tokens.\nSacrifice a Goblin: This creature has base power and toughness 3/3 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Goblin" } } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Sacrifice a Goblin: This creature has base power and toughness 3/3 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Rogue Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 black Goblin Rogue creature tokens.",
    },
  ],
});
