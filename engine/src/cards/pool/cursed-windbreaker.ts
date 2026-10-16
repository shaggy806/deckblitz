import { defineCard } from "../define.js";

// EDHREC rank 16429.
//
// Dissection Tools' enters trigger: "that creature" is the card manifested
// this way, the one permanent this resolution put onto the battlefield; with
// an empty library nothing is manifested and nothing attached. A Windbreaker
// that has left by then attaches nothing, but the manifest still happens (the
// ruling).
const ENTER_TEXT = "When this Equipment enters, manifest dread, then attach this Equipment to that creature.";

export default defineCard({
  name: "Cursed Windbreaker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT} (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nEquipped creature has flying.\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "manifest-dread" },
          {
            kind: "choose-permanents",
            filter: { thisWay: "put-onto-battlefield" },
            min: 1,
            upTo: 1,
            then: { kind: "attach", target: 0 },
            prompt: "Attach Cursed Windbreaker to the manifested creature",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Equipped creature has flying.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
