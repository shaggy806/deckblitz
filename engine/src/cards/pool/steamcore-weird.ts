import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 30387. Vibrance's intervening-if, at {R}.

const TEXT = "When this creature enters, if {R} was spent to cast it, it deals 2 damage to any target.";

export default defineCard({
  name: "Steamcore Weird",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Weird"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfColors: { R: 1 } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
