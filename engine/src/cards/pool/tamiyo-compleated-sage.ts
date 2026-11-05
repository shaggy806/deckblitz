import { defineCard } from "../define.js";

// EDHREC rank 9086. Restore Relic's shape for the −X: the copy is of the card
// as it was exiled.

export default defineCard({
  name: "Tamiyo, Compleated Sage",
  manaCost: "{2}{G}{G/U/P}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tamiyo"],
  loyalty: 5,
  compleated: true,
  text: "Compleated ({G/U/P} can be paid with {G}, {U}, or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)\n+1: Tap up to one target artifact or creature. It doesn't untap during its controller's next untap step.\n−X: Exile target nonland permanent card with mana value X from your graveyard. Create a token that's a copy of that card.\n−7: Create Tamiyo's Notebook, a legendary colorless Book artifact token with \"Spells you cast cost {2} less to cast\" and \"{T}: Draw a card.\"",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "artifact-or-creature" }],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: "+1: Tap up to one target artifact or creature. It doesn't untap during its controller's next untap step.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
            notTypes: ["land"],
            manaValue: { op: "eq", n: "x" },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token-copy", of: 0, count: 1, who: "you" },
        ],
      },
      resolve: null,
      text: "−X: Exile target nonland permanent card with mana value X from your graveyard. Create a token that's a copy of that card.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Tamiyo's Notebook Token", count: 1 },
      resolve: null,
      text: "−7: Create Tamiyo's Notebook, a legendary colorless Book artifact token with \"Spells you cast cost {2} less to cast\" and \"{T}: Draw a card.\"",
    },
  ],
});
