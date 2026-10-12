import { defineCard } from "../define.js";

export default defineCard({
  name: "Zog, Triceraton Castaway",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Soldier"],
  power: 5,
  toughness: 4,
  keywords: ["reach", "trample"],
  cycling: { cost: "{2}", search: { subtype: "Mountain" } },
  text: "Reach, trample\nWhen Zog enters, target creature can't block this turn.\nMountaincycling {2} ({2}, Discard this card: Search your library for a Mountain card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "When Zog enters, target creature can't block this turn.",
    },
  ],
});
