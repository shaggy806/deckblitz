import { defineCard } from "../define.js";

// EDHREC rank 27648. An intervening-if (rule 603.4): checked as it triggers
// and as it resolves, by any artifact or enchantment each time (the ruling).

const TEXT =
  "When this creature enters, if you control an artifact or enchantment, return target creature an opponent controls to its owner's hand.";

export default defineCard({
  name: "Moonlit Scavengers",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { typesAnyOf: ["artifact", "enchantment"] }, atLeast: 1 },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
