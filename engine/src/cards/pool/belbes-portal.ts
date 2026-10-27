import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 12700.
//
// Rulings:
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.
//
// Icon of Ancestry's chosen type (`chooseCreatureTypeOnEnter`, read by
// `ofChosenType`) on Elvish Piper's hand-to-battlefield choice (min 0).

const TEXT = "{3}, {T}: You may put a creature card of the chosen type from your hand onto the battlefield.";

export default defineCard({
  name: "Belbe's Portal",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: `As this artifact enters, choose a creature type.\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", ofChosenType: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
