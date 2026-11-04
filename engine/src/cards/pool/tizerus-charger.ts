import { defineCard } from "../define.js";

// The counter is chosen as it enters, not as it's cast with escape (the ruling).
export default defineCard({
  name: "Tizerus Charger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 3,
  toughness: 2,
  text: "Escape—{4}{B}, Exile five other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\nThis creature escapes with your choice of a +1/+1 counter or a flying counter on it.",
  escape: { cost: "{4}{B}", exileCount: 5, counterChoice: ["+1/+1", "flying"] },
});
