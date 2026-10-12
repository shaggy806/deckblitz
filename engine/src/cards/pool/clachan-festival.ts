import { defineCard } from "../define.js";

export default defineCard({
  name: "Clachan Festival",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["kindred", "enchantment"],
  subtypes: ["Kithkin"],
  text: "When this enchantment enters, create two 1/1 green and white Kithkin creature tokens.\n{4}{W}: Create a 1/1 green and white Kithkin creature token.",
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 1 },
      resolve: null,
      text: "{4}{W}: Create a 1/1 green and white Kithkin creature token.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 2 },
      resolve: null,
      text: "When this enchantment enters, create two 1/1 green and white Kithkin creature tokens.",
    },
  ],
});
