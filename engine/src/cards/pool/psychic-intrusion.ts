import { defineCard } from "../define.js";

// The exiled card stays its owner's (rule 108.3) and yours to cast, with mana
// of any color, for as long as it stays in exile.
export default defineCard({
  name: "Psychic Intrusion",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it. You may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.",
  targets: ["opponent"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"] },
    destination: "exile",
    alsoFrom: { zone: "graveyard", filter: { notTypes: ["land"] } },
    mayPlay: { duration: "while-exiled", spendAs: "any-color" },
  },
});
