import { defineCard } from "../define.js";

// EDHREC rank 4908.
//
// Entering as a copy, it copies the creature's copiable values (what it
// copies, if it's a copy; a token's as made) and its "enters" abilities work;
// declining, it's a 0/0. Renew's copies enter nothing (rule 707.4): each other
// creature you control as it resolves copies the target's copiable values —
// not the counter it just got — until the cleanup step (rule 514.2), keeping
// its own counters, status and the effects on it.
const CLONE_TEXT = "You may have this creature enter as a copy of any creature on the battlefield.";
const RENEW_TEXT =
  "Renew — {2}{U}, Exile this card from your graveyard: Put a +1/+1 counter on target nonlegendary creature you control. Each other creature you control becomes a copy of that creature until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Naga Fleshcrafter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Shapeshifter"],
  power: 0,
  toughness: 0,
  text: `${CLONE_TEXT}\n${RENEW_TEXT}`,
  copyOnEnter: { filter: { type: "creature" } },
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", notSupertype: "legendary" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "become-copy",
            filter: { type: "creature", controlledBy: "you" },
            exceptOf: true,
            of: 0,
            until: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: RENEW_TEXT,
      zone: "graveyard",
      sorcerySpeed: true,
    },
  ],
});
