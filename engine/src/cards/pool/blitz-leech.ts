import { defineCard } from "../define.js";

// "That creature" is the trigger's target: the -2/-2 first, then every
// counter of every kind comes off it (a +1/+1 counter keeping it alive gone
// too, so it dies to the state-based action after the trigger resolves).

const ETB_TEXT =
  "When this creature enters, target creature an opponent controls gets -2/-2 until end of turn. Remove all counters from that creature.";

export default defineCard({
  name: "Blitz Leech",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 5,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
          { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
