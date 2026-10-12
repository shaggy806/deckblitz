import { defineCard } from "../define.js";

export default defineCard({
  name: "Vinelasher Adept",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  cycling: { cost: "{2}", search: { supertype: "basic", type: "land" } },
  text: "Reach\nWhen this creature enters, put three +1/+1 counters on target creature.\nBasic landcycling {2} ({2}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
      resolve: null,
      text: "When this creature enters, put three +1/+1 counters on target creature.",
    },
  ],
});
