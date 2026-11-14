import { defineCard } from "../define.js";

// EDHREC rank 14922. No mana cost, so it can only be suspended (Ancestral
// Vision's shape); red by its color indicator. Tokens and a commander put into
// the command zone instead count toward "that many" (the rulings); the
// non-Aura permanent cards enter at once, then the Auras, each choosing among
// what's already there.
export default defineCard({
  name: "Glimpse of Tomorrow",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Suspend 3—{R}{R} (Rather than cast this card from your hand, pay {R}{R} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\n" +
    "Shuffle all permanents you own into your library, then reveal that many cards from the top of your library. Put all non-Aura permanent cards revealed this way onto the battlefield, then do the same for Aura cards, then put the rest on the bottom of your library in a random order.",
  suspend: { n: 3, cost: "{R}{R}" },
  effect: {
    kind: "shuffle-graveyard-into-library",
    target: "you",
    zones: ["permanents"],
    revealThatMany: {
      onto: [
        { notTypes: ["instant", "sorcery"], notSubtypes: ["Aura"] },
        { subtype: "Aura" },
      ],
      rest: "bottom-random",
    },
  },
});
