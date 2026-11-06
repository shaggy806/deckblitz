import { defineCard } from "../define.js";

// Mystery Booster Commander. A legendary sorcery (rule 205.4e) that can be
// your commander (rule 903.3a). X is the mana actually spent on it — 0 cast
// for free.
const DISCOVER =
  "Discover X, where X is the amount of mana spent to cast this spell. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

export default defineCard({
  name: "Ashaya's Enduring Bond",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["sorcery"],
  canBeCommander: true,
  text: `(You may cast a legendary sorcery only if you control a legendary creature or planeswalker.)\n${DISCOVER}\nAshaya's Enduring Bond can be your commander.`,
  effect: { kind: "discover", amount: { manaSpentOf: "source" } },
});
