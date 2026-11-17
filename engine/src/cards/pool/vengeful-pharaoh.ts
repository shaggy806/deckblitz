import { defineCard } from "../define.js";

// EDHREC rank 13655. Magic 2012.
//
// The graveyard trigger works only there (`fromGraveyard`), with "if this
// card is in your graveyard" an intervening if on the same card (rule 603.4:
// the second of two triggers does nothing once the first put it on top, even
// if it's back in the graveyard — a new object, rule 400.7). The batched
// damage trigger fires once per recipient in a damage event — you, and each
// planeswalker of yours (`orPlaneswalker`) — however many creatures hit it,
// as the rulings say; combat damage your own attackers deal you counts too.

const RETURN_TEXT =
  "Whenever combat damage is dealt to you or a planeswalker you control, if this card is in your graveyard, destroy target attacking creature, then put this card on top of your library.";

export default defineCard({
  name: "Vengeful Pharaoh",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 5,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${RETURN_TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "deals-damage-batch", who: "any", to: "you", orPlaneswalker: true, combat: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "put-on-library", target: "source", position: "top" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
