import { defineCard } from "../define.js";

// EDHREC rank 14439. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses. Each of these
//     abilities checks your graveyard at the moment it would trigger to see if it does. If you
//     don't have the required number of permanent cards in your graveyard at that time, the
//     ability doesn't trigger at all. If it does trigger, it will check again as it tries to
//     resolve.
//
// Elvish Regrower's return, behind the descend 4 intervening "if".

const TEXT =
  "Descend 4 — When this creature enters, if there are four or more permanent cards in your graveyard, return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Coati Scavenger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { notTypes: ["instant", "sorcery"] } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
