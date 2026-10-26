import { defineCard } from "../define.js";

// Rulings: it can move any kind of counter (a kind chosen as it resolves among those on the
// first target); if either target is illegal the counter doesn't move. Two instances of
// "target" (rule 115.3): one creature may be both, and then nothing moves (rule 122.5).

export default defineCard({
  name: "Leech Bonder",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 3,
  text: "This creature enters with two -1/-1 counters on it.\n{U}, {Q}: Move a counter from target creature onto a second target creature. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{U}", tap: false, untap: true },
      targets: ["creature", "creature"],
      effect: { kind: "move-counters", from: 0, to: 1 },
      resolve: null,
      text: "{U}, {Q}: Move a counter from target creature onto a second target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
