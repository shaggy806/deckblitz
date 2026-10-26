import { defineCard } from "../define.js";

// EDHREC rank 9718.
// Any Soldier may be sacrificed, not only the tokens it made (the ruling).

export default defineCard({
  name: "Knight-Captain of Eos",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create two 1/1 white Soldier creature tokens.\n{W}, Sacrifice a Soldier: Prevent all combat damage that would be dealt this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: { filter: { subtype: "Soldier" } } },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: "{W}, Sacrifice a Soldier: Prevent all combat damage that would be dealt this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 2 },
      resolve: null,
      text: "When this creature enters, create two 1/1 white Soldier creature tokens.",
    },
  ],
});
