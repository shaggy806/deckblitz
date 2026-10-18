import { defineCard } from "../define.js";

// EDHREC rank 11858. March of the Machine.
//
// The land isn't targeted: it's chosen as the ability resolves, after the
// surveil, so it may be one just surveilled into the graveyard (the ruling).

const TEXT =
  "Whenever this creature deals combat damage to a player or battle, surveil 1, then you may return a land card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Deeproot Wayfinder",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (To surveil 1, look at the top card of your library. You may put that card into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
