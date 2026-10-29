import { defineCard } from "../define.js";

// EDHREC rank 22249.

export default defineCard({
  name: "Hovel Hurler",
  manaCost: "{3}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 6,
  toughness: 7,
  text: "This creature enters with two -1/-1 counters on it.\n{R/W}{R/W}, Remove a counter from this creature: Another target creature you control gets +1/+0 and gains flying until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{R/W}{R/W}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{R/W}{R/W}, Remove a counter from this creature: Another target creature you control gets +1/+0 and gains flying until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
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
