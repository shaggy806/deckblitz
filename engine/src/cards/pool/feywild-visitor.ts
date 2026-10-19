import { defineCard } from "../define.js";

const GRANTED_TEXT =
  "Whenever one or more nontoken creatures you control deal combat damage to a player, you create a 1/1 blue Faerie Dragon creature token with flying.";
const TEXT = `Commander creatures you own have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Feywild Visitor",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsTriggered: [
        {
          // Rooftop Bypass's batched trigger: once per player dealt combat
          // damage by one or more of them.
          trigger: {
            on: "deals-damage-batch",
            who: "you-control",
            filter: { token: false, type: "creature" },
            combat: true,
          },
          targets: [],
          effect: { kind: "create-token", token: "Faerie Dragon Token", count: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
