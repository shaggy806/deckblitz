import { defineCard } from "../define.js";

// EDHREC rank 25355. The front face of Torrent Sculptor // Flamethrower
// Sonata (a modal double-faced card).
//
// Rulings:
//   [2021-04-16] You choose which instant or sorcery card to exile as Torrent Sculptor's
//     enters-the-battlefield ability resolves. You must exile one if able.
//
// Not a target: a `look-and-choose` over the graveyard, at least one when
// there is one, exiled without a link; its `then` reads the exiled card's
// mana value.
const ETB_TEXT =
  "When this creature enters, exile an instant or sorcery card from your graveyard. Put a number of +1/+1 counters on this creature equal to half that card's mana value, rounded up.";

export default defineCard({
  name: "Torrent Sculptor",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "exile",
        unlinked: true,
        leftover: "stay",
        then: {
          kind: "add-counter",
          target: "source",
          counter: "+1/+1",
          amount: { half: { manaValueOf: 0 }, round: "up" },
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  faces: ["Torrent Sculptor", "Flamethrower Sonata"],
});
