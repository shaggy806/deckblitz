import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] If Archfiend's Vessel leaves the battlefield while its triggered ability is on
//     the stack, you can't exile it from the zone it's put into, so you won't create a Demon.
//     ("source" names nothing once it has left — rule 400.7 — so nothing is exiled this way.)

export default defineCard({
  name: "Archfiend's Vessel",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, if it entered from your graveyard or you cast it from your graveyard, exile it. If you do, create a 5/5 black Demon creature token with flying.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "Your graveyard": a card only ever goes to its owner's graveyard, so
      // "from a graveyard" and owned by its controller is from theirs.
      condition: {
        kind: "source",
        filter: {
          ownedBy: "you",
          anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard", castBy: "you" }],
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: { kind: "create-token", token: "5/5 Demon Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, if it entered from your graveyard or you cast it from your graveyard, exile it. If you do, create a 5/5 black Demon creature token with flying.",
    },
  ],
});
