import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 9308. "That many" is the combat damage dealt (`triggerValue`).
// "Any number" is a `may` of one or more, Ainok Wayfarer's shape: declining,
// or having no such card among the milled ones, puts no card into your hand,
// so the counter goes on.
const COMBAT =
  "Whenever Nashi deals combat damage to a player, you mill that many cards. You may put any number of legendary and/or enchantment cards from among them into your hand. If you put no cards into your hand this way, put a +1/+1 counter on Nashi.";

const LEGENDARY_OR_ENCHANTMENT: CardFilter = { anyOf: [{ supertype: "legendary" }, { type: "enchantment" }] };
const MILLED_PICK: CardFilter = { thisWay: "milled", ...LEGENDARY_OR_ENCHANTMENT };
const COUNTER = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Nashi, Searcher in the Dark",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Ninja", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace\n${COMBAT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: { triggerValue: true } },
          {
            kind: "conditional",
            // Milled this way wherever they went (a Rest in Peace exiles them,
            // and they're still "among them" — rule 701.17c).
            condition: { kind: "this-way", what: "milled", filter: LEGENDARY_OR_ENCHANTMENT },
            then: {
              kind: "may",
              prompt: "Put legendary and/or enchantment cards from among the milled cards into your hand?",
              effect: {
                kind: "look-and-choose",
                zone: "graveyard",
                min: 1,
                max: { triggerValue: true },
                destination: "hand",
                leftover: "stay",
                filter: MILLED_PICK,
              },
              else: COUNTER,
            },
            else: COUNTER,
          },
        ],
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
