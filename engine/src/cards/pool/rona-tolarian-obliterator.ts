import { defineCard } from "../define.js";

// The back face of Rona, Herald of Invasion. "That source's controller" is
// the trigger's controller (Crag Saurian's `"trigger-controller"`), who exiles
// a card at random from their own hand (`choose-random-card`, `zone: "hand"`
// — the move shows it). Rona's controller then may put a land onto the
// battlefield under their control, or may cast anything else free as the
// trigger resolves (`cast-now`, timing ignored — the ruling).
const TEXT =
  "Whenever a source deals damage to Rona, that source's controller exiles a card from their hand at random. If it's a land card, you may put it onto the battlefield under your control. Otherwise, you may cast it without paying its mana cost.";

export default defineCard({
  name: "Rona, Tolarian Obliterator",
  art: "https://cards.scryfall.io/art_crop/back/f/4/f487b582-e73f-4325-939f-95fc5a9aba49.jpg",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "trigger-controller",
        effect: {
          kind: "choose-random-card",
          zone: "hand",
          whose: "that-player",
          then: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: 0, fromHand: true },
              {
                kind: "conditional",
                condition: { kind: "target", index: 0, filter: { type: "land" } },
                then: {
                  kind: "may",
                  prompt: "Put the exiled land onto the battlefield under your control?",
                  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
                },
                else: { kind: "cast-now", target: 0, free: true },
              },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Rona, Herald of Invasion", "Rona, Tolarian Obliterator"],
  transform: true,
});
