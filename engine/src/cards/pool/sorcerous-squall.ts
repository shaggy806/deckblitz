import { defineCard } from "../define.js";

// Not a target: the spell is chosen as this resolves, from
// that player's graveyard with the nine cards in it. The caster controls it and its
// owner still owns it (rule 108.3).
const SPELL_TEXT =
  "Target opponent mills nine cards, then you may cast an instant or sorcery spell from that player's graveyard without paying its mana cost. If that spell would be put into a graveyard, exile it instead.";

export default defineCard({
  name: "Sorcerous Squall",
  manaCost: "{6}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  delve: true,
  text: `Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\n${SPELL_TEXT}`,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 9 },
      {
        kind: "cast-now",
        from: { graveyardOf: { target: 0 } },
        spell: { typesAnyOf: ["instant", "sorcery"] },
        free: true,
        exileAfter: true,
      },
    ],
  },
});
