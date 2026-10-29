import { defineCard } from "../define.js";

// EDHREC rank 21724.

export default defineCard({
  name: "Gnarlbark Elm",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warlock"],
  power: 3,
  toughness: 4,
  text: "This creature enters with two -1/-1 counters on it.\n{2}{B}, Remove two counters from this creature: Target creature gets -2/-2 until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, removeCounter: { kind: "any", count: 2 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{B}, Remove two counters from this creature: Target creature gets -2/-2 until end of turn. Activate only as a sorcery.",
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
