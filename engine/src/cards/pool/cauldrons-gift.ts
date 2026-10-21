import { defineCard } from "../define.js";

// The creature card is chosen, not targeted, as the spell resolves — so it may
// be one the adamant mill just put there (the ruling).
const ADAMANT = "Adamant — If at least three black mana was spent to cast this spell, mill four cards.";

export default defineCard({
  name: "Cauldron's Gift",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${ADAMANT}\nYou may choose a creature card in your graveyard. If you do, return it to the battlefield with an additional +1/+1 counter on it.`,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 3 } } },
        then: { kind: "mill", target: "you", amount: 4 },
      },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        withCounters: { kind: "+1/+1", amount: 1 },
        leftover: "stay",
      },
    ],
  },
});
