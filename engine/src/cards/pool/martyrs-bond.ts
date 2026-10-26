import { defineCard } from "../define.js";

// Rulings:
//   [2011-09-22] If Martyr's Bond and other nonland permanents are put into the graveyard from the
//     battlefield at the same time, Martyr's Bond will trigger for itself and each of those other
//     nonland permanents.
//   [2011-09-22] Each opponent must sacrifice only one permanent for each trigger, even if the
//     nonland permanent you controlled that went to the graveyard had multiple types.
//
// One trigger per permanent put into the graveyard (`dies` fires for any
// permanent, itself included); "shares a card type with it" is bound to the
// trigger object's card types as it last existed on the battlefield — one
// `typesAnyOf`, so an artifact creature asks for an artifact *or* a creature.

const TEXT =
  "Whenever this enchantment or another nonland permanent you control is put into a graveyard from the battlefield, each opponent sacrifices a permanent of their choice that shares a card type with it.";

export default defineCard({
  name: "Martyr's Bond",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { notTypes: ["land"] } },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { sharesCardTypeWith: "trigger-object" },
        count: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
