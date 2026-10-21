import { defineCard } from "../define.js";

// EDHREC rank 12634. The second ability doesn't target: the tapped land is
// chosen as it resolves (a `choose-permanents`), so a hexproof land can be
// picked and nothing is chosen until then.

export default defineCard({
  name: "Living Twister",
  manaCost: "{R}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 5,
  text: "{1}{R}, Discard a land card: This creature deals 2 damage to any target.\n{G}: Return a tapped land you control to its owner's hand.",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, discard: { count: 1, filter: { type: "land" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{1}{R}, Discard a land card: This creature deals 2 damage to any target.",
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", tapped: true, controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a tapped land you control to its owner's hand",
      },
      resolve: null,
      text: "{G}: Return a tapped land you control to its owner's hand.",
    },
  ],
});
