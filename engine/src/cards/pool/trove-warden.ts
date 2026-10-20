import { defineCard } from "../define.js";

// Rulings:
//   A landfall ability triggers whenever a land you control enters for any reason.
//
// The landfall exile is linked to this permanent (rule 607.2a — `exile { linked }`), so
// its dies trigger finds exactly the cards this stint exiled and puts them onto the
// battlefield under their owners' control (`return-exiled-by-source`'s `linked`).

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, exile target permanent card with mana value 3 or less from your graveyard.";
const DIES_TEXT =
  "When this creature dies, put each permanent card exiled with it onto the battlefield under the control of that card's owner.";

export default defineCard({
  name: "Trove Warden",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${LANDFALL_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: LANDFALL_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
