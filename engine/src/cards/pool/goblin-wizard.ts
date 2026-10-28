import { defineCard } from "../define.js";

// EDHREC rank 17175.
//
// Rulings:
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.

export default defineCard({
  name: "Goblin Wizard",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{T}: You may put a Goblin permanent card from your hand onto the battlefield.\n{R}: Target Goblin gains protection from white until end of turn.",
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
        filter: { subtype: "Goblin", notTypes: ["instant", "sorcery"] },
      },
      resolve: null,
      text: "{T}: You may put a Goblin permanent card from your hand onto the battlefield.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Goblin" } }],
      effect: { kind: "grant-protection", target: 0, from: { colors: ["W"] }, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Target Goblin gains protection from white until end of turn.",
    },
  ],
});
