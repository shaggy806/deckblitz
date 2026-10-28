import { defineCard } from "../define.js";

// EDHREC rank 31035.
//
// Dragonsoul Knight's shape: "becomes an Angel" replaces its creature types.
//
// Rulings:
//   [2009-02-01] When Paragon of the Amesha's activated ability resolves, Paragon of the Amesha
//     will gain flying and lifelink in addition to its other abilities. However, becoming an Angel
//     will make it lose all other creature types. It will no longer be a Human or a Knight.
//   [2009-10-01] You can activate Paragon of the Amesha's ability more than once during a turn.
//     The second time it resolves, it will get another +3/+3 and gain another instance of
//     lifelink.

export default defineCard({
  name: "Paragon of the Amesha",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: "First strike\n{W}{U}{B}{R}{G}: Until end of turn, this creature becomes an Angel, gets +3/+3, and gains flying and lifelink.",
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", setSubtypes: ["Angel"], duration: "end-of-turn" },
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{W}{U}{B}{R}{G}: Until end of turn, this creature becomes an Angel, gets +3/+3, and gains flying and lifelink.",
    },
  ],
});
