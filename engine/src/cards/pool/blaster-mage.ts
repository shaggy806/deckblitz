import { defineCard } from "../define.js";

const TEXT = "{R}, {T}, Discard a card: Destroy target Wall.";

export default defineCard({
  name: "Blaster Mage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "permanent", filter: { subtype: "Wall" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
