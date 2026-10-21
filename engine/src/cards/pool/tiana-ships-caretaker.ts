import { defineCard } from "../define.js";

// EDHREC rank 10608.
//
// Rulings:
//   [2018-04-27] If an Aura you control is put into a graveyard immediately after Tiana leaves the
//     battlefield, most likely because Tiana left the battlefield but the Aura was put into the
//     graveyard as a state-based action after it found itself not attached to anything, Tiana's
//     last ability won't trigger.
//   [2018-04-27] If an Aura or Equipment leaves the graveyard after triggering Tiana's last
//     ability, it won't be returned to its owner's hand as the delayed triggered ability resolves.
//   [2018-04-27] If an Aura or Equipment is put into your graveyard during an end step, you'll be
//     able to return it during the next end step, not the current one.
//   [2018-04-27] Tiana's last ability triggers and creates a delayed triggered ability that will
//     let you return the Aura or Equipment during the next end step. It will do so even if Tiana
//     leaves the battlefield before the next end step.
//   [2018-04-27] If an Aura or Equipment you control is put into a graveyard at the same time as
//     Tiana is, most likely because an effect destroyed all nonland permanents, you'll be able to
//     return it to its owner's hand at the beginning of the next end step.
//
// Liesa, Forgotten Archangel's delayed return of "that card" (found only if
// it's still the same card in the graveyard, rule 400.7), with the "you may"
// asked as the delayed ability resolves. `dies` is "put into a graveyard from
// the battlefield" for any permanent (Ashiok's Reaper).

const TRIGGER_TEXT =
  "Whenever an Aura or Equipment you control is put into a graveyard from the battlefield, you may return that card to its owner's hand at the beginning of the next end step.";

export default defineCard({
  name: "Tiana, Ship's Caretaker",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { subtypes: ["Aura", "Equipment"] } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: {
          kind: "may",
          prompt: "Return that card to its owner's hand?",
          effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
        },
        text: "You may return that card to its owner's hand.",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
