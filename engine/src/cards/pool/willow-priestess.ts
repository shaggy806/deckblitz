import { defineCard } from "../define.js";

// EDHREC rank 24362.
//
// Rulings:
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.

export default defineCard({
  name: "Willow Priestess",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Faerie", "Druid"],
  power: 2,
  toughness: 2,
  text: "{T}: You may put a Faerie permanent card from your hand onto the battlefield.\n{2}{G}: Target green creature gains protection from black until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { subtype: "Faerie", notTypes: ["instant", "sorcery"] },
      },
      resolve: null,
      text: "{T}: You may put a Faerie permanent card from your hand onto the battlefield.",
    },
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "grant-protection", target: 0, from: { colors: ["B"] }, duration: "end-of-turn" },
      resolve: null,
      text: "{2}{G}: Target green creature gains protection from black until end of turn.",
    },
  ],
});
