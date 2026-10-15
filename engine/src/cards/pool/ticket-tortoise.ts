import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, if an opponent controls more lands than you, you create a Treasure token.";

export default defineCard({
  name: "Ticket Tortoise",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Turtle"],
  power: 3,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender\n${ENTER_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
