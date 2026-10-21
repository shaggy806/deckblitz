import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, exile cards from the top of your library until you exile a nonland permanent card. Put that card onto the battlefield or into your hand.";

// The cards are exiled face up; you choose battlefield or hand after seeing
// the card found. Every other card exiled stays in exile, and so does the
// one found if it can't enter (an Aura with nothing to enchant).
export default defineCard({
  name: "Illuna, Apex of Wishes",
  manaCost: "{2}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Beast", "Elemental", "Dinosaur"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  mutate: "{3}{R/G}{U}{U}",
  text: `Mutate {3}{R/G}{U}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying, trample\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"], notTypes: ["land"] },
        exile: true,
        then: {
          kind: "may",
          prompt: "Put that card onto the battlefield? (If you don't, it goes into your hand.)",
          effect: { kind: "put-onto-battlefield", target: 0 },
          else: { kind: "return-to-hand", target: 0, from: "exile" },
        },
        rest: "stay",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
