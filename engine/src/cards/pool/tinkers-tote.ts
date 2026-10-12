import { defineCard } from "../define.js";

export default defineCard({
  name: "Tinker's Tote",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: "When this artifact enters, create two 1/1 colorless Gnome artifact creature tokens.\n{W}, Sacrifice this artifact: You gain 3 life.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{W}, Sacrifice this artifact: You gain 3 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Gnome Token", count: 2 },
      resolve: null,
      text: "When this artifact enters, create two 1/1 colorless Gnome artifact creature tokens.",
    },
  ],
});
