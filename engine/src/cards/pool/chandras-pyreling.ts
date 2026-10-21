import { defineCard } from "../define.js";

// EDHREC rank 12927.
//
// Rulings:
//   [2020-06-23] Combat damage is the damage that's dealt automatically by attacking and blocking
//     creatures. Any other damage is noncombat damage, even if it's dealt during a combat phase by
//     an attacking or blocking creature.
//   [2020-06-23] The ability triggers just once per event for each opponent who is dealt
//     noncombat damage by a source you control, regardless of how much damage that player is dealt.
//
// Niv-Mizzet, Visionary's trigger: once per damage event per opponent.

const TEXT =
  "Whenever a source you control deals noncombat damage to an opponent, this creature gets +1/+0 and gains double strike until end of turn.";

export default defineCard({
  name: "Chandra's Pyreling",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Lizard"],
  power: 1,
  toughness: 3,
  text: `${TEXT} (It deals both first-strike and regular combat damage.)`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
