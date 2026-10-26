import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 20301.
//
// Tourach, Dread Cantor's per-card discard trigger, with Breach's pump and fear on itself.
//
// Rulings:
//   [2006-02-01] If your opponent discards any cards during their cleanup step to get down to the
//     maximum hand size, the ability will trigger and players will receive priority. After that
//     cleanup step ends, a new one will begin and Abyssal Nocturnus's effect will end. It won't
//     carry over into the next turn.
//   [2006-02-01] If your opponent discards multiple cards to a single effect, this will trigger
//     multiple times.

const TEXT =
  "Whenever an opponent discards a card, this creature gets +2/+2 and gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)";

export default defineCard({
  name: "Abyssal Nocturnus",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "opponent", perCard: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "fear", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
