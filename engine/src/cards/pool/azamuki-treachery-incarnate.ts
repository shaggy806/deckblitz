import { defineCard } from "../define.js";

export default defineCard({
  name: "Azamuki, Treachery Incarnate",
  art: "https://cards.scryfall.io/art_crop/front/1/f/1fe2b76f-ddb7-49d5-933b-ccb06be5d46f.jpg",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 2,
  text: "Remove a ki counter from Azamuki: Gain control of target creature until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ki", count: 1 } },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: true },
      resolve: null,
      text: "Remove a ki counter from Azamuki: Gain control of target creature until end of turn.",
    },
  ],
  faces: ["Cunning Bandit", "Azamuki, Treachery Incarnate"],
  flip: true,
});
