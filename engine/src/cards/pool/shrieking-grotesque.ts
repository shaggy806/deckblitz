import { defineCard } from "../define.js";

// EDHREC rank 31530. "If {B} was spent to cast it" is an intervening if on
// the mana spent (Deceit's `manaSpentOfColors`, here one {B}).
const TEXT = "When this creature enters, if {B} was spent to cast it, target player discards a card.";

export default defineCard({
  name: "Shrieking Grotesque",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
