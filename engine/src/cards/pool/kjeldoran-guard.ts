import { defineCard } from "../define.js";

// EDHREC rank 31473.
//
// Every opponent of the active player is a defending player during combat (rule 802.2), whoever
// controls the Guard and whether or not anything attacks, and "defending player" is one of them
// its controller chooses (802.2a): the restriction holds if any one of them controls no snow lands.
// Its source is never attacking, so `"defending-player"`, which reads what the source attacks,
// can't say this. "When that creature leaves" is Kjeldoran Elite Guard's delayed trigger.

const TEXT =
  "{T}: Target creature gets +1/+1 until end of turn. When that creature leaves the battlefield this turn, sacrifice this creature. Activate only during combat and only if defending player controls no snow lands.";

export default defineCard({
  name: "Kjeldoran Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", duringCombat: true },
          {
            kind: "of-player",
            player: "active-player",
            condition: {
              kind: "of-player",
              player: "an-opponent",
              condition: { kind: "not", of: { kind: "controls", filter: { type: "land", supertype: "snow" }, atLeast: 1 } },
            },
          },
        ],
      },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard", "exile", "hand", "library", "command"], thisTurn: true },
            effect: { kind: "sacrifice-source" },
            text: "When that creature leaves the battlefield this turn, sacrifice Kjeldoran Guard.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
