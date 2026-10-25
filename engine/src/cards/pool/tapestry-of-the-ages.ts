import { defineCard } from "../define.js";

const TEXT = "{2}, {T}: Draw a card. Activate only if you've cast a noncreature spell this turn.";

export default defineCard({
  name: "Tapestry of the Ages",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
