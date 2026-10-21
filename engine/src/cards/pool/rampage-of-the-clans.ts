import { defineCard } from "../define.js";

// "For each permanent destroyed this way, its controller creates" is Curse of
// the Swine's shape over a destroy: every permanent the destroy-all destroyed
// counts for its controller as it left (an indestructible one wasn't
// destroyed; one a replacement sent elsewhere still was — both rulings). The
// wrath is one event, so all of them are gone before any Centaur arrives.
export default defineCard({
  name: "Rampage of the Clans",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy all artifacts and enchantments. For each permanent destroyed this way, its controller creates a 3/3 green Centaur creature token.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
      {
        kind: "create-token",
        token: "3/3 Centaur Token",
        who: "each-player",
        count: { thisWay: "destroyed", who: "each" },
      },
    ],
  },
});
