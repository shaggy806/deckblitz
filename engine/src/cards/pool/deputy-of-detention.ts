import { defineCard } from "../define.js";

// EDHREC rank 15484.
//
// One target; the opponent's other nonland permanents sharing its name (rule
// 201.2a) go with it, untargeted (`CardFilter.sameNameAsTarget`), all until
// this creature leaves (rule 610.3). Gone before the trigger resolves: nothing
// is exiled (610.3a, the ruling).

const TEXT =
  "When this creature enters, exile target nonland permanent an opponent controls and all other nonland permanents that player controls with the same name as that permanent until this creature leaves the battlefield.";

export default defineCard({
  name: "Deputy of Detention",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["nonland-permanent-an-opponent-controls"],
      effect: {
        kind: "exile-all",
        filter: { notTypes: ["land"], controlledBy: "you", sameNameAsTarget: 0 },
        controlledByTarget: 0,
        untilSourceLeaves: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
