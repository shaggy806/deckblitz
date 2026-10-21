import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 10796.
//
// Rulings:
//   [2022-12-08] Once a player announces that they're casting a spell or activating an ability, no
//     player may take other actions until the spell or ability has been paid for. Notably, other
//     players can't try to tap that player's permanents to stop them from paying {T} or to stop
//     them from producing enough mana.

const TEXT = "{1}, {T}: Tap target artifact, creature, or land.";

export default defineCard({
  name: "Icy Manipulator",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
