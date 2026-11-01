import { defineCard } from "../define.js";

// EDHREC rank 492.
const TEXT =
  "Creatures you control are every creature type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";

export default defineCard({
  name: "Maskwood Nexus",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT}\n{3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling. (It is every creature type.)`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addSubtypes: ["(every creature type)"],
      typesOutsideBattlefield: { ofType: "creature", addSubtypes: ["(every creature type)"] },
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Shapeshifter Token (Blue)", count: 1 },
      resolve: null,
      text: "{3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling.",
    },
  ],
});
