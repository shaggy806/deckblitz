import { defineCard } from "../define.js";

// Rulings: the revealed card is played while the ability resolves or not at
// all; a land only on your turn with a land play left (`play` asks the land
// rules); a free spell's X is 0 and additional costs may still be paid. A card
// not played — declined, or not castable or playable now — is exiled.

const TEXT =
  "{2}{U}{U}, Remove a wish counter from this creature: Reveal the top card of your library. You may play that card without paying its mana cost. If you don't, exile it.";

export default defineCard({
  name: "Djinn of Wishes",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nThis creature enters with three wish counters on it.\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false, removeCounter: { kind: "wish", count: 1 } },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { libraryTop: 1, reveal: true },
        play: true,
        free: true,
        else: { kind: "exile-from-library", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "wish", amount: 3 } },
      text: "This creature enters with three wish counters on it.",
    },
  ],
});
