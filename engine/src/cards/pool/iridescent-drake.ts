import { defineCard } from "../define.js";

// EDHREC rank 26004. An Aura that can't legally enchant the Drake (or with the
// Drake gone) stays in its graveyard — `attachedTo`'s rule, and the ruling.
//
// Rulings:
//   In a multiplayer game, if a player leaves the game, all cards that player owns leave as well.
//   If you leave the game, the Aura you control from Iridescent Drake's ability is exiled.
//   Iridescent Drake's triggered ability can target any Aura card in a graveyard. However, if the
//   Aura can't be attached to Iridescent Drake, it remains in its owner's graveyard and doesn't
//   enter the battlefield.

const TEXT =
  "When this creature enters, put target Aura card from a graveyard onto the battlefield under your control attached to this creature.";

export default defineCard({
  name: "Iridescent Drake",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { subtype: "Aura" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, attachedTo: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
