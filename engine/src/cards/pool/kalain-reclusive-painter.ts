import { defineCard } from "../define.js";

// EDHREC rank 4566.
// Makes Treasure → use "Treasure Token".
// The counters read the mana from Treasures each entering creature kept from its cast\n(`manaSpentOf` the trigger object, with `from`).

const ENTER_TEXT = "When Kalain enters, create a Treasure token.";
const COUNTERS_TEXT =
  "Other creatures you control enter with an additional +1/+1 counter on them for each mana from a Treasure spent to cast them.";

export default defineCard({
  name: "Kalain, Reclusive Painter",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Bard"],
  power: 1,
  toughness: 2,
  text: `${ENTER_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { manaSpentOf: "trigger-object", from: { subtype: "Treasure" } } },
      },
      text: COUNTERS_TEXT,
    },
  ],
});
