import { defineCard } from "../define.js";

// With no duration, for good: nine counters on a 0/0, legendary (so two of them
// meet the legend rule) and named Vitu-Ghazi, a Forest still taps for mana.
export default defineCard({
  name: "Awakening of Vitu-Ghazi",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put nine +1/+1 counters on target land you control. It becomes a legendary 0/0 Elemental creature with haste named Vitu-Ghazi. It's still a land.",
  targets: ["land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 9 },
      {
        kind: "become",
        target: 0,
        power: 0,
        toughness: 0,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        addSupertypes: ["legendary"],
        keywords: ["haste"],
        name: "Vitu-Ghazi",
        duration: "permanent",
      },
    ],
  },
});
