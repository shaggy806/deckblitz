import { defineCard } from "../define.js";

// The disturb back face of Dorothea, Vengeful Victim: an Aura spell cast from
// the graveyard transformed. The token enters attacking a player or
// planeswalker its controller chooses — not necessarily the one the enchanted
// creature attacks — and was never declared as an attacker (the rulings;
// Kavaron Harrier's `attacking: "choose"`). Its "exile it instead" is the
// face's own ability (`self` — rule 702.146), as Luminous Phantom's is.
const GRANTED =
  "Whenever this creature attacks, create a 4/4 white Spirit creature token with flying that's tapped and attacking. Sacrifice that token at end of combat.";
const STATIC_TEXT = `Enchanted creature has "${GRANTED}"`;
const EXILE_TEXT = "If Dorothea's Retribution would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Dorothea's Retribution",
  art: "https://cards.scryfall.io/art_crop/back/8/c/8c927707-abb5-4a9d-ac53-25df182d6e9b.jpg",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}\n${EXILE_TEXT}`,
  targets: ["creature"],
  faces: ["Dorothea, Vengeful Victim", "Dorothea's Retribution"],
  transform: true,
  disturb: { cost: "{1}{W}{U}" },
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              {
                kind: "create-token",
                token: "Spirit Token (Dorothea's Retribution)",
                count: 1,
                tapped: true,
                attacking: "choose",
              },
              {
                kind: "delayed-trigger",
                at: "end-of-combat",
                about: "created",
                effect: { kind: "sacrifice-target", target: 0 },
                text: "Sacrifice that token.",
              },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
});
