import { defineCard } from "../define.js";

// EDHREC rank 19098. Whether you control both is read as the ability resolves,
// and only artifacts with those names count (its rulings).

const TEXT =
  "{1}, {T}: Create a 1/1 white Soldier creature token. Create five of those tokens instead if you control artifacts named Crown of Empires and Scepter of Empires.";

export default defineCard({
  name: "Throne of Empires",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Soldier Token",
        count: {
          ifCondition: {
            kind: "all",
            of: [
              { kind: "controls", filter: { type: "artifact", name: "Crown of Empires" }, atLeast: 1 },
              { kind: "controls", filter: { type: "artifact", name: "Scepter of Empires" }, atLeast: 1 },
            ],
          },
          then: 5,
          else: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
