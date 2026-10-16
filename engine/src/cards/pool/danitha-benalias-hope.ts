import { defineCard } from "../define.js";

// EDHREC rank 4808.
//
// Rulings:
//   [2022-09-09] Conversely, if you attempt to put a non-Aura Equipment onto the battlefield this
//     way and Danitha is no longer on the battlefield or that Equipment can't legally be attached
//     to Danitha, that Equipment will enter the battlefield unattached.
//   [2022-09-09] If you attempt to put an Aura onto the battlefield this way and Danitha is no
//     longer on the battlefield or that Aura can't legally be attached to Danitha, that Aura does
//     not enter the battlefield at all. Instead, it will stay in its previous zone.

export default defineCard({
  name: "Danitha, Benalia's Hope",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike", "vigilance", "lifelink"],
  text: "First strike, vigilance, lifelink\nWhen Danitha enters, you may put an Aura or Equipment card from your hand or graveyard onto the battlefield attached to Danitha.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // One choice over hand and graveyard. An Aura that can't enchant
      // Danitha — or with Danitha gone — stays where it is; an Equipment
      // enters unattached (the rulings; rules 303.4i, 301.5e).
      effect: {
        kind: "may",
        prompt: "Put an Aura or Equipment card from your hand or graveyard onto the battlefield attached to Danitha?",
        effect: {
          kind: "return-from-graveyard",
          filter: { subtypes: ["Aura", "Equipment"] },
          destination: "battlefield",
          count: 1,
          from: "hand-or-graveyard",
          attachedTo: "source",
        },
      },
      resolve: null,
      text: "When Danitha enters, you may put an Aura or Equipment card from your hand or graveyard onto the battlefield attached to Danitha.",
    },
  ],
});
