import { defineCard } from "../define.js";

const CRACK = "{1}, {T}, Sacrifice this artifact: Exile up to one target card from a graveyard. Draw a card.";
const MANA = "{1}, Exile this card from your graveyard: Add one mana of any color.";

export default defineCard({
  name: "Jack-o'-Lantern",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CRACK}\n${MANA}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: CRACK,
    },
    {
      cost: { mana: "{1}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
  ],
});
