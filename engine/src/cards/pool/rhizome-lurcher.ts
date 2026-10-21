import { defineCard } from "../define.js";

// EDHREC rank 18352. Guilds of Ravnica. Golgari Grave-Troll's count; returned
// from the graveyard, it counts itself (the ruling).

export default defineCard({
  name: "Rhizome Lurcher",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Fungus", "Zombie"],
  power: 2,
  toughness: 2,
  text: "Undergrowth — This creature enters with a number of +1/+1 counters on it equal to the number of creature cards in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
      },
      text: "Undergrowth — This creature enters with a number of +1/+1 counters on it equal to the number of creature cards in your graveyard.",
    },
  ],
});
