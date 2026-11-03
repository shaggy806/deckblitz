import { defineCard } from "../define.js";

// Rulings:
//   In a multiplayer game, it triggers once for each player you attack with at least two creatures.
//   They must attack the same player: creatures attacking that player's planeswalkers or battles
//     don't count.

const TEXT =
  "Whenever two or more creatures you control attack a player, target attacking creature without flying gains flying until end of turn.";

export default defineCard({
  name: "Landroval, Horizon Witness",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Noble"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "you", defender: "any", atLeast: 2 },
      targets: [
        {
          kind: "permanent",
          whose: "any",
          filter: { type: "creature", attacking: true, notKeyword: "flying" },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
