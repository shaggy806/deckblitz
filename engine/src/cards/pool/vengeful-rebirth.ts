import { defineCard } from "../define.js";

// Rulings: a land card can be returned, for no damage; if the graveyard card
// has become an illegal target, nothing is returned and no damage is dealt; if
// only the damage target is illegal, the card is still returned. Exiled as it
// resolves either way (but not if both targets are illegal — then it doesn't
// resolve).

export default defineCard({
  name: "Vengeful Rebirth",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Return target card from your graveyard to your hand. If you return a nonland card to your hand this way, Vengeful Rebirth deals damage equal to that card's mana value to any target.\nExile Vengeful Rebirth.",
  targets: [{ kind: "card-in-graveyard", whose: "you" }, "any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "returned-to-hand", filter: { notTypes: ["land"] } },
        // "That card's mana value": the returned card, read in the hand it
        // went to (a `thisWay` sum reads only cards in public zones).
        then: { kind: "damage", target: 1, amount: { manaValueOf: 0 } },
      },
    ],
  },
  exileOnResolve: true,
});
