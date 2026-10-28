import { defineCard } from "../define.js";

// EDHREC rank 27891.
// The bonus counts the Treasure mana spent on this spell as it resolves; the damage is a\none-sided fight (Rabid Bite's shape), read after the bonus.

export default defineCard({
  name: "Spoils of the Hunt",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gets +1/+0 until end of turn for each mana from a Treasure that was spent to cast this spell. Then that creature deals damage equal to its power to target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt",
        target: 0,
        power: { manaSpentOf: "source", from: { subtype: "Treasure" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      { kind: "fight", a: 0, b: 1, oneSided: true },
    ],
  },
});
