import { defineCard } from "../define.js";

// EDHREC rank 6798.
//
// Squee, Goblin Nabob's graveyard upkeep trigger (`fromGraveyard`), with Oloro's
// intervening-if on its own zone (rule 603.4): it triggers only while this card
// is in your graveyard, and does nothing if it has left (or left and come back
// as a new object) by the time it resolves. The target is chosen as it goes on
// the stack — this card itself is a legal one — and the `may` only asks for
// the {2}{G} (Veinwitch Coven's shape).

const TEXT =
  "At the beginning of your upkeep, if this creature is in your graveyard, you may pay {2}{G}. If you do, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Genesis",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Incarnation"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to return target creature card to your hand?",
        cost: "{2}{G}",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
