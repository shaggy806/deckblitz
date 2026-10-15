import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 8773. Final Fantasy.
//
// Rulings:
//   [2025-06-06] You don't choose a target for The Falcon's second ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you sacrifice The Falcon this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond to
//     this triggered ability as normal.
//
// "You may sacrifice it. When you do" is a `may` of `sacrifice-source`, whose
// `then` (only once the sacrifice happened) triggers the reflexive ability —
// so its target is chosen afterwards, and The Falcon itself, by then in the
// graveyard, isn't a creature card a choice could find (a Vehicle). The
// graveyard ability is Reassembling Skeleton's.
const DAMAGE_TEXT =
  "Whenever The Falcon deals combat damage to a player, you may sacrifice it. When you do, return target creature card from your graveyard to the battlefield.";
const RETURN_TEXT = "{4}{B}: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "The Falcon, Airship Restored",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}\n${RETURN_TEXT}\nCrew 2`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice The Falcon to return a creature card from your graveyard to the battlefield?",
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "reflexive-trigger",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
            effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
            text: "When you do, return target creature card from your graveyard to the battlefield.",
          },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
    crew(2),
  ],
});
