import { defineCard } from "../define.js";

// The total is of the cards' mana values in the graveyard, checked as
// they're targeted and again as it resolves (Nethroi's shape, by mana value).
export default defineCard({
  name: "Patch Up",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return up to three target creature cards with total mana value 3 or less from your graveyard to the battlefield.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      max: 3,
      maxTotalManaValue: 3,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0 },
  },
});
