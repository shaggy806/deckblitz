import { defineCard } from "../define.js";

// EDHREC rank 15403.
//
// The cost exiles the Book and the other two together, each chosen as a
// sacrifice of several is (`exilesSacrifice` of an `each`), recorded as the
// cards in exile; Vecna gets their printed triggered abilities as copiable
// values (`withTriggeredOf`), so Eye of Vecna's enters ability triggers for it.
const END_TEXT =
  "At the beginning of your end step, if you lost 2 or more life this turn, create a 2/2 black Zombie creature token.";
const VECNA_TEXT =
  "{T}, Exile The Book of Vile Darkness and artifacts you control named Eye of Vecna and Hand of Vecna: Create Vecna, a legendary 8/8 black Zombie God creature token with indestructible and all triggered abilities of the exiled cards.";

export default defineCard({
  name: "The Book of Vile Darkness",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${END_TEXT}\n${VECNA_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: {
          each: [
            { isSource: true },
            { type: "artifact", hasName: "Eye of Vecna" },
            { type: "artifact", hasName: "Hand of Vecna" },
          ],
        },
        exilesSacrifice: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Vecna Token", count: 1, withTriggeredOf: { paid: "exiled" } },
      resolve: null,
      text: VECNA_TEXT,
    },
  ],
});
