import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, exile all artifact and enchantment cards from all graveyards.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return all artifact and enchantment cards from all graveyards to their owners' hands.";

export default defineCard({
  name: "Saprazzan Bailiff",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "exile-graveyard",
        target: "each-player",
        filter: { typesAnyOf: ["artifact", "enchantment"] },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        from: "all-graveyards",
        filter: { typesAnyOf: ["artifact", "enchantment"] },
        destination: "hand",
        count: "all",
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
