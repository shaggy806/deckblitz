import { defineCard } from "../define.js";

// EDHREC rank 17632.

export default defineCard({
  name: "Sunstrike Legionnaire",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "This creature doesn't untap during your untap step.\nWhenever another creature enters, untap this creature.\n{T}: Tap target creature with mana value 3 or less.",
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This creature doesn't untap during your untap step.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target creature with mana value 3 or less.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever another creature enters, untap this creature.",
    },
  ],
});
