import { defineCard } from "../define.js";

// EDHREC rank 8719. Final Fantasy.
//
// Rulings:
//   [2025-06-06] If the exiled card has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//
// "If you do" is the card actually exiled; its mana value is read off what
// was exiled this way (a `this-way` condition — the card in exile is a new
// object, rule 400.7). The counter goes on the token after it enters
// (`thenCounters`), as "create … Put a +1/+1 counter on it" says.
const TEXT =
  "At the beginning of your end step, you may exile target creature card from a graveyard. If you do, create a 1/1 white Spirit creature token with flying. Put a +1/+1 counter on it if the exiled card's mana value is 4 or greater.";

export default defineCard({
  name: "Summoner's Sending",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Exile target creature card from a graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", filter: { manaValue: { op: "gte", n: 4 } } },
              then: {
                kind: "create-token",
                token: "Spirit Token",
                count: 1,
                thenCounters: { kind: "+1/+1", amount: 1 },
              },
              else: {
                kind: "conditional",
                condition: { kind: "this-way", what: "exiled" },
                then: { kind: "create-token", token: "Spirit Token", count: 1 },
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
