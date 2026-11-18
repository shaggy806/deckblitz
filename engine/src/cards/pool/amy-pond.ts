import { defineCard } from "../define.js";
import { partnerWithTrigger } from "../helpers.js";

// EDHREC rank 13920.
//
// Rulings:
//   [2023-10-13] Amy Pond has two different partner abilities, but you can't have Amy, Rory, and
//     the Doctor as your commanders at the same time. Amy must choose one of the two. Even if your
//     other commander is one of the Doctor cards, however, the "Partner with Rory Williams"
//     ability can still search for Rory in a library.
//   [2023-10-13] Although Doctor's companion is a new variant of the partner ability, the rules
//     for partner have not otherwise changed. Notably, Time Lord Doctors and cards with Doctor's
//     companion do not interact with cards which have another partner ability.
//   [2023-10-13] The Doctor's companion ability allows you to have two commanders if one has the
//     ability and the other is a legendary creature that is a Time Lord Doctor and has no other
//     creature types. Creatures with the changeling ability, for example, can't be a second
//     commander this way.
//   [2023-10-13] A suspended card is a card that (1) has suspend, (2) is in exile, and (3) has one
//     or more time counters on it.
//   [2023-10-13] If you remove the last time counter from a suspended card this way, you will cast
//     that card.
//
// Two partner abilities (rule 702.124g): a deck pairs her with Rory Williams
// or with a Time Lord Doctor, never both. The suspended card is chosen, not
// targeted, as the trigger resolves; its last time counter removed, suspend
// casts it (702.62a).
const PARTNER_TEXT =
  "Partner with Rory Williams (When this creature enters, target player may put Rory into their hand from their library, then shuffle.)";
const DAMAGE_TEXT =
  "Whenever Amy Pond deals combat damage to a player, choose a suspended card you own and remove that many time counters from it.";

export default defineCard({
  name: "Amy Pond",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: [{ kind: "partner-with", name: "Rory Williams" }, { kind: "doctors-companion" }],
  text: `${PARTNER_TEXT}\n${DAMAGE_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    partnerWithTrigger("Rory Williams"),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exile",
        min: 1,
        max: 1,
        filter: { ownedBy: "you", suspended: true },
        destination: "stay",
        leftover: "stay",
        then: { kind: "remove-counter", target: 0, counter: "time", amount: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
