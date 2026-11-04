import { defineCard } from "../define.js";

// The grant is `grant-graveyard-keyword`'s `escape`: until end of turn, whatever
// becomes of Desdemona, at normal timing (the rulings). The cost is the face's own
// mana cost, with two other cards exiled from the graveyard.
const ATTACK_TEXT =
  "Whenever Desdemona attacks, target creature card in your graveyard that's an artifact or that has mana value 3 or less gains escape until end of turn. The escape cost is equal to its mana cost plus exile two other cards from your graveyard. (You may cast it from your graveyard for its escape cost this turn.)";

export default defineCard({
  name: "Desdemona, Freedom's Edge",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  supertypes: ["legendary"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            type: "creature",
            anyOf: [{ type: "artifact" }, { manaValue: { op: "lte", n: 3 } }],
          },
        },
      ],
      effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "escape", exileCount: 2 } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
