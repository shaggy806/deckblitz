import { defineCard } from "../define.js";

// EDHREC rank 12920.
//
// Rulings (the omen rulings — rule 720):
//   [2025-04-04] If an Omen spell is countered or an effect causes it to otherwise leave the
//     stack, it won't be shuffled into its owner's library.
//   [2025-04-04] An omen card is a creature card in every zone except the stack, as well as while
//     on the stack if not cast as an Omen.
//   [2025-04-04] As a player casts an omen card, the player chooses whether they cast the card
//     normally or as an Omen.
//   [2025-04-04] If a spell is cast as an Omen, its controller shuffles it into its owner's
//     library instead of putting it into its owner's graveyard as it resolves.
//
// "Remove all counters" is every kind (`remove-counter`, `counter: "any"`,
// `amount: "all"` — Perfect Intimidation).
const ENTER_TEXT = "When this creature enters, remove all counters from up to one target creature.";

export default defineCard({
  name: "Purging Stormbrood",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nWard—Pay 2 life.\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 2 } },
      resolve: null,
      text: "Ward—Pay 2 life.",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "remove-counter", target: 0, counter: "any", amount: "all" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Purging Stormbrood", "Absorb Essence"],
  omen: true,
});
