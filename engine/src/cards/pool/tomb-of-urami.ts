import { defineCard } from "../define.js";

// EDHREC rank 17743.
// The mana ability's damage is its `also`, only without an Ogre (the
// controller's, as the ability resolves). "Sacrifice all lands you control"
// is a cost act (`do: sacrifice-all`), this land among them, paid after the
// mana and the tap once the ability is on the stack (602.2b, 601.2h).
const MANA_TEXT = "{T}: Add {B}. Tomb of Urami deals 1 damage to you if you don't control an Ogre.";
const URAMI_TEXT =
  "{2}{B}{B}, {T}, Sacrifice all lands you control: Create Urami, a legendary 5/5 black Demon Spirit creature token with flying.";

export default defineCard({
  name: "Tomb of Urami",
  supertypes: ["legendary"],
  types: ["land"],
  text: `${MANA_TEXT}\n${URAMI_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "B",
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Ogre" }, atLeast: 1 } },
          then: { kind: "damage", amount: 1, who: "you" },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: {
        mana: "{2}{B}{B}",
        tap: true,
        do: { kind: "sacrifice-all", who: "you", filter: { type: "land" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Urami", count: 1 },
      resolve: null,
      text: URAMI_TEXT,
    },
  ],
});
