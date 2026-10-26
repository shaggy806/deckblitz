import { defineCard } from "../define.js";

// EDHREC rank 10187.
//
// Rulings:
//   [2016-06-08] A creature card that you own but don't control will be put into your graveyard if
//     that creature dies, and Field of Souls's ability will trigger. (Hence `ownedBy`, as Magus of
//     the Bridge.)

const TEXT =
  "Whenever a nontoken creature is put into your graveyard from the battlefield, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Field of Souls",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
