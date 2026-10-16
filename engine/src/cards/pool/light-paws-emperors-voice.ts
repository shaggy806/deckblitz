import { defineCard } from "../define.js";

// EDHREC rank 3136.
//
// Rulings:
//   [2022-02-18] If the Aura card you find can't be attached to Light-Paws for any reason, it
//     stays in your library and does not enter the battlefield.

export default defineCard({
  name: "Light-Paws, Emperor's Voice",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fox", "Advisor"],
  power: 2,
  toughness: 2,
  text: "Whenever an Aura you control enters, if you cast it, you may search your library for an Aura card with mana value less than or equal to that Aura and with a different name than each Aura you control, put that card onto the battlefield attached to Light-Paws, then shuffle.",
  triggered: [
    {
      // "If you cast it" (rule 603.4's intervening if) reads how the Aura
      // entered, which can't change while it stays, so the check as the
      // ability resolves is the same one.
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Aura", cast: true, castBy: "you" },
      },
      targets: [],
      // "That Aura" is read as it last existed if it has left (rule 608.2h);
      // "each Aura you control" as the search is made. The find can't be
      // attached to Light-Paws — gone, or an Aura that can't enchant it — and
      // stays in the library (the ruling).
      effect: {
        kind: "may",
        prompt: "Search your library for an Aura card to put onto the battlefield attached to Light-Paws?",
        effect: {
          kind: "search-library",
          filter: {
            subtype: "Aura",
            manaValue: { op: "lte", n: { amount: { manaValueOf: "trigger-object" } } },
            nameDiffersFromEach: { subtype: "Aura", controlledBy: "you" },
          },
          destination: "battlefield",
          attachedToSource: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: "Whenever an Aura you control enters, if you cast it, you may search your library for an Aura card with mana value less than or equal to that Aura and with a different name than each Aura you control, put that card onto the battlefield attached to Light-Paws, then shuffle.",
    },
  ],
});
