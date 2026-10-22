import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 25732.
//
// Rulings:
//   - Can sacrifice the Druid to itself.
//   - The land animation doesn't wear off if the land stops being a Forest; it lasts until end of
//     turn.
//   - The most recent land animating ability takes precedence.
//   - Only affects Forests that are on the battlefield when the effect resolves.
//
// `animate-all` fixes its matches as it begins and sets their base P/T in layer 7b, timestamped,
// so a later animation wins; the sacrifice may be the Druid itself (`creature-you-control`).
const TEXT =
  "{1}{G}, {T}, Sacrifice a creature: Forests you control become 2/3 creatures until end of turn. They're still lands.";

export default defineCard({
  name: "Thelonite Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "animate-all",
        filter: { type: "land", subtype: "Forest", controlledBy: "you" },
        power: 2,
        toughness: 3,
        addTypes: ["creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
