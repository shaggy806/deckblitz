import { defineCard } from "../define.js";

export default defineCard({
  name: "Duskrider Peregrine",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  suspend: { n: 3, cost: "{1}{W}" },
  text: "Flying, protection from black\nSuspend 3—{1}{W} (Rather than cast this card from your hand, you may pay {1}{W} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)",
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
