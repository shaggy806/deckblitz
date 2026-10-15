import { defineCard } from "../define.js";

// EDHREC rank 26222. Dredger's Insight's mill-then-pick, from among the cards
// milled this way only.
const ABILITY_TEXT =
  "{3}, {T}: Mill four cards. You may put a Hero or enchantment card from among those cards into your hand.";

export default defineCard({
  name: "Rick Jones, Destined Sidekick",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 0,
  toughness: 3,
  text: `${ABILITY_TEXT} (To mill four cards, put the top four cards of your library into your graveyard.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", anyOf: [{ subtype: "Hero" }, { type: "enchantment" }] },
          },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
