import { defineCard } from "../define.js";

// The token's size is the exiled card's P/T, read as the card last was
// (the rulings) — `basePt`, as Soul Separator's Zombie.
export default defineCard({
  name: "Ritual of the Returned",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target creature card from your graveyard. Create a black Zombie creature token. Its power is equal to that card's power and its toughness is equal to that card's toughness.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "create-token",
        token: "Zombie Token (Black 0/0)",
        count: 1,
        basePt: { power: { powerOf: 0 }, toughness: { toughnessOf: 0 } },
      },
    ],
  },
});
