import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 28730.
//
// Vibrance's intervening-if on the colours spent to cast it.

const TEXT = "When this creature enters, if {G} was spent to cast it, destroy target artifact.";

export default defineCard({
  name: "Tin Street Hooligan",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
