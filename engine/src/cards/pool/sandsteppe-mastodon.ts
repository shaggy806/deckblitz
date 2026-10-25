import { defineCard } from "../define.js";

// EDHREC rank 21704. Fate Reforged.

export default defineCard({
  name: "Sandsteppe Mastodon",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 5,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, bolster 5. (Choose a creature with the least toughness among creatures you control and put five +1/+1 counters on it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "bolster", amount: 5 },
      resolve: null,
      text: "When this creature enters, bolster 5.",
    },
  ],
});
