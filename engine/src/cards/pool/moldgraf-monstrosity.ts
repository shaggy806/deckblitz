import { defineCard } from "../define.js";

// EDHREC rank 7925. Exiled first, so it can't return itself; the two cards
// return even when it can't be exiled (its ruling), picked at random from what
// is there as the ability resolves, and enter together.
const TEXT =
  "When this creature dies, exile it, then return two creature cards at random from your graveyard to the battlefield.";

export default defineCard({
  name: "Moldgraf Monstrosity",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "choose-random-card",
            zone: "graveyard",
            filter: { type: "creature" },
            count: 2,
            then: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "put-onto-battlefield", target: 0 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
