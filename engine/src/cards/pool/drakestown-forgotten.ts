import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 23904.
//
// X counts creature cards in every graveyard (no `ownedBy`), read as the replacement
// applies — before the card moves, so one entering from a graveyard counts itself
// (the ruling).
export default defineCard({
  name: "Drakestown Forgotten",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  text: "This creature enters with X +1/+1 counters on it, where X is the number of creature cards in all graveyards.\n{2}{B}, Remove a +1/+1 counter from this creature: Target creature gets -1/-1 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature" } } },
      },
      text: "This creature enters with X +1/+1 counters on it, where X is the number of creature cards in all graveyards.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{B}, Remove a +1/+1 counter from this creature: Target creature gets -1/-1 until end of turn.",
    },
  ],
});
