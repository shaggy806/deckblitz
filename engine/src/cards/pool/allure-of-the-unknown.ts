import { defineCard } from "../define.js";

// EDHREC rank 17606. Which opponent is the caster's choice with the six cards
// in view (`chooser: "an-opponent"`, Guided Passage's); that opponent exiles
// one, the rest go to the caster's hand, and the look's `then` — run for the
// player who chose — offers that opponent the free cast, now or never (the
// ruling), timing ignored (rule 608.2g). Six lands: nothing exiled, all six
// to hand (the ruling).

const TEXT =
  "Reveal the top six cards of your library. An opponent exiles a nonland card from among them, then you put the rest into your hand. That opponent may cast the exiled card without paying its mana cost.";

export default defineCard({
  name: "Allure of the Unknown",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: true,
    chooser: "an-opponent",
    filter: { notTypes: ["land"] },
    min: 1,
    max: 1,
    destination: "exile",
    unlinked: true,
    leftover: "hand",
    prompt: "Exile a nonland card: you may cast it without paying its mana cost, and they put the rest into their hand",
    then: { kind: "cast-now", target: 0, free: true },
  },
});
