import { defineCard } from "../define.js";

// Rulings:
//   For example, if Thromok devours one creature, it will enter with one +1/+1 counter on it. If it
//     devours two creatures, it will enter with two +1/+1 counters for each of them, for a total of
//     four +1/+1 counters. Devouring three creatures will produce nine +1/+1 counters, and so on.

export default defineCard({
  name: "Thromok the Insatiable",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hellion"],
  power: 0,
  toughness: 0,
  devour: { multiplier: "devoured", filter: { type: "creature" } },
  text: "Devour X, where X is the number of creatures devoured this way (As this creature enters, you may sacrifice any number of creatures. It enters with X +1/+1 counters on it for each of those creatures.)",
});
