import { defineCard } from "../define.js";

// EDHREC rank 14096.
//
// Rulings:
//   Protection from a player means that you and each planeswalker you control have protection from
//     each object controlled by that player. If an object has no controller (such as a card in a
//     graveyard), its owner is considered its controller for this purpose.
//   Creatures that player controls can still attack you or planeswalkers you control, but the
//     damage they would deal will be prevented.
//
// "If you cast it" is an intervening if read off how it entered (The One
// Ring). The extra turn is the target opponent's, after this one (rule
// 500.7). "You" gain protection from that player as a player effect (rule
// 702.16k, Guardian Archon's), and the planeswalkers you control as it
// resolves gain it with one timestamp (rule 611.2c): one that arrives later
// doesn't. Both last until your next turn, so through that opponent's extra
// turn.

const ENTER_TEXT =
  "When this creature enters, if you cast it, target opponent takes an extra turn after this one. Until your next turn, you and planeswalkers you control gain protection from that player.";

export default defineCard({
  name: "Eon Frolicker",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Otter"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "take-extra-turn", target: 0 },
          {
            kind: "player-effect",
            duration: "until-your-next-turn",
            protectionFromPlayers: { who: "you", from: { target: 0 } },
          },
          {
            kind: "grant-protection",
            filter: { type: "planeswalker", controlledBy: "you" },
            from: { fromPlayer: { target: 0 } },
            duration: "until-your-next-turn",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
