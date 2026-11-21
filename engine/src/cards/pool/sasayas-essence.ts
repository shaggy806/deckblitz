import { defineCard } from "../define.js";

// A triggered mana ability (rule 605.1b): off the stack, made with the
// land's own mana. "It" is the tapped land (the trigger object), counted by
// name as the mana is made (`tappedForManaExtras` reads the amount with it);
// each extra unit is its own pick among the types the land made, so four
// Mossfire Valleys tapped for {R}{G} add three in any mix of {R} and {G}
// (the rulings).

const TEXT =
  "Whenever a land you control is tapped for mana, add an additional one mana of any type that land produced for each other land you control with the same name as it.";

export default defineCard({
  name: "Sasaya's Essence",
  art: "https://cards.scryfall.io/art_crop/front/d/2/d224c50f-8146-4c91-9401-04e5bd306d02.jpg",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "produced",
        amount: {
          countOf: { type: "land", controlledBy: "you", sameNameWith: "trigger-object", notObject: "trigger-object" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Sasaya, Orochi Ascendant", "Sasaya's Essence"],
  flip: true,
});
