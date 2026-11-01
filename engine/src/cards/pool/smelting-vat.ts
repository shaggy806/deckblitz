import { defineCard } from "../define.js";

// The cap is the sacrificed artifact's mana value as it last existed (rule
// 608.2h), read as this resolves; nothing else about the choice can move it.
const TEXT =
  "{1}, {T}, Sacrifice another artifact: Reveal the top eight cards of your library. Put up to two noncreature " +
  "artifact cards with total mana value less than or equal to the sacrificed artifact's mana value from among them " +
  "onto the battlefield and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Smelting Vat",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 8,
        reveal: true,
        min: 0,
        max: 2,
        filter: { type: "artifact", notTypes: ["creature"] },
        together: { totalManaValueAtMost: { manaValueOf: "sacrificed" } },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
