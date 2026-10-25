import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 22469.
//
// Every player's tapped lands count. The land keeps its name, other types and
// abilities (the rulings).

export default defineCard({
  name: "Ignition Team",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 0,
  toughness: 0,
  text: "This creature enters with X +1/+1 counters on it, where X is the number of tapped lands on the battlefield.\n{2}{R}, Remove a +1/+1 counter from this creature: Target land becomes a 4/4 red Elemental creature until end of turn. It's still a land.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countOf: { type: "land", tapped: true } } },
      },
      text: "This creature enters with X +1/+1 counters on it, where X is the number of tapped lands on the battlefield.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: ["land"],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        setColors: ["R"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}{R}, Remove a +1/+1 counter from this creature: Target land becomes a 4/4 red Elemental creature until end of turn. It's still a land.",
    },
  ],
});
