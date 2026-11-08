import { defineCard } from "../define.js";

const TEXT =
  "{T}, Exile this artifact: Each player exiles the top seven cards of their library. Until your next turn, players may play cards they exiled this way, and they can't play cards from their hand. Activate only as a sorcery.";

/** Each card's owner may play it (`playedBy: "owner"`) until the
 * activator's next turn — the window is read from the controller's side.
 * "Can't play cards from their hand" bars casting and land plays from the
 * hand alike (`lands`, `from: ["hand"]`); other zones' permissions stand
 * (its ruling). */
export default defineCard({
  name: "Memory Vessel",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "impulse-exile",
            amount: 7,
            duration: "until-your-next-turn",
            whose: "each-player",
            byOwner: true,
            play: true,
          },
          {
            kind: "player-effect",
            duration: "until-your-next-turn",
            cantCast: { who: "each-player", filter: {}, lands: true, from: ["hand"], label: "cards from their hand" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
