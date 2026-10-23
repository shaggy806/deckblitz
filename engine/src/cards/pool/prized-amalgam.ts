import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature enters, if it entered from your graveyard or you cast it from your graveyard, return this card from your graveyard to the battlefield tapped at the beginning of the next end step.";

// Works only from the graveyard (the ruling: one already on the battlefield
// isn't returned later). Breathless Knight's filter for "entered from / cast
// from your graveyard" — owned by you, since a card is only ever in its
// owner's graveyard; a madness cast is from exile (the ruling). The delayed
// return, The Locust God's, finds the card only if it's still the same one
// in the graveyard (rule 400.7).
export default defineCard({
  name: "Prized Amalgam",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: {
          type: "creature",
          ownedBy: "you",
          anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard", castBy: "you" }],
        },
      },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
        text: "Return Prized Amalgam from your graveyard to the battlefield tapped.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
