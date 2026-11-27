import { defineCard } from "../define.js";

// The equipped creature has every nonlegendary creature card's name beside its
// own (`addsAllNames`, kept on the creature by `refreshStaticNames`): a "with
// the same name" read, a chosen name (Pithing Needle) and the legend rule
// (704.5j — two legends each carrying a Kit share a name) all see them. The
// catalogue is every card a game here can hold (`nameableCardNames`).
const STATIC_TEXT =
  "Equipped creature gets +1/+1 and has all names of nonlegendary creature cards in addition to its name.";

export default defineCard({
  name: "Spy Kit",
  manaCost: "{2}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      addsAllNames: { types: ["creature"], nonlegendary: true },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
