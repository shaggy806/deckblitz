import { defineCard } from "../define.js";

export default defineCard({
  name: "Birthing Boughs",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{4}, {T}: Create a 2/2 colorless Shapeshifter creature token with changeling. (It is every creature type.)",
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Shapeshifter Token (Irregular Cohort)", count: 1 },
      resolve: null,
      text: "{4}, {T}: Create a 2/2 colorless Shapeshifter creature token with changeling.",
    },
  ],
});
