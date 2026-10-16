import { defineCard } from "../define.js";

// EDHREC rank 11690.
//
// Conductive Machete's shape with a cloak (rule 701.58a): the card cloaked
// this way is what the Coat attaches to. The cloak happens even if the Coat
// has left by then (the ruling); the attach then finds no Coat to move. No
// equip ability — the trigger is the only way it gets attached.
const ENTERS =
  "When this Equipment enters, cloak the top card of your library, then attach this Equipment to it. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)";
const EQUIPPED = "Equipped creature gets +1/+0 and can't be blocked.";
const BOUNCE = "{1}{U}: Return this Equipment to its owner's hand.";

export default defineCard({
  name: "Cryptic Coat",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\n${EQUIPPED}\n${BOUNCE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "manifest", who: "you", cloak: true },
          {
            kind: "choose-permanents",
            filter: { thisWay: "put-onto-battlefield" },
            min: 1,
            upTo: 1,
            then: { kind: "attach", target: 0 },
            prompt: "Attach Cryptic Coat to the cloaked creature",
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], grantKeywords: ["unblockable"], text: EQUIPPED }],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
