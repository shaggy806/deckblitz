import { defineCard } from "../define.js";

const TEXT =
  "{2}, Exile a card from your hand: Return target card from your graveyard to your hand if it shares a card type with the card exiled this way. (Artifact, battle, creature, enchantment, kindred, instant, land, planeswalker, and sorcery are card types.)";

export default defineCard({
  name: "Holistic Wisdom",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileFromHand: { count: 1 } },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      // The exiled card is the cost's (`{ paid: "exiled" }`), read as it is
      // in exile; the target as it is in the graveyard as the ability
      // resolves (rule 608.2h). Card types per rule 205.2a.
      effect: {
        kind: "conditional",
        condition: { kind: "object-matches", object: 0, filter: { sharesCardTypeWith: { paid: "exiled" } } },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
