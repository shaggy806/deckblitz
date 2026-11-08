import { defineCard } from "../define.js";

// #94 in top-commanders.txt.
//
// Rulings:
//   Vial Smasher's triggered ability triggers when you cast your first spell each turn, regardless
//     of whose turn it is.
//   The opponent to be dealt damage is chosen at random while the triggered ability is resolving.
//     After that opponent is chosen, you choose whether damage will be dealt to that player or to a
//     planeswalker they control, and if so, which planeswalker. No player may take any actions
//     between the damage recipient being chosen and the damage being dealt.
//   For spells with {X} in their mana costs, use the value chosen for X to determine the spell's
//     mana value.
//   If Vial Smasher's ability resolves and the spell that caused it to trigger has been countered,
//     use that spell's mana value as it last existed on the stack to determine how much damage is
//     dealt.
//
// The planeswalker is a `vote` with `choose`, not a `choose-permanents`: its `then` runs without
// the trigger object, so the damage is the step after the choice, on what was chosen this way.

const TEXT =
  "Whenever you cast your first spell each turn, choose an opponent at random. Vial Smasher deals damage equal to that spell's mana value to that player or a planeswalker that player controls.";

export default defineCard({
  name: "Vial Smasher the Fierce",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Berserker"],
  power: 2,
  toughness: 3,
  pairing: { kind: "partner" },
  text: `${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: {
        kind: "choose-opponent",
        random: true,
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Deal the damage to that player",
              effect: { kind: "damage", amount: { manaValueOf: "trigger-object" }, who: "that-player" },
            },
            {
              text: "Deal the damage to a planeswalker that player controls",
              onlyIf: {
                kind: "of-player",
                player: "that-player",
                condition: { kind: "controls", filter: { type: "planeswalker" }, atLeast: 1 },
              },
              effect: {
                kind: "sequence",
                effects: [
                  {
                    kind: "vote",
                    choose: true,
                    who: "you",
                    for: {
                      permanent: { type: "planeswalker" },
                      about: "that-player",
                      prompt: "Choose a planeswalker that player controls to deal the damage to",
                    },
                  },
                  { kind: "damage-all", filter: { thisWay: "chosen" }, amount: { manaValueOf: "trigger-object" } },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
