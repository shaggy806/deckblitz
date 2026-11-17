import { defineCard } from "../define.js";

// EDHREC rank 12122.
//
// Rulings:
//   [2024-03-08] The tokens copy exactly what was printed on the original Aura and nothing else
//     (unless that Aura was itself copying something else; see below). It doesn't copy whether
//     that Aura was tapped or untapped, whether it had any counters on it or Auras attached to
//     it, or any non-copy effects that changed its types, color, and so on.
//   [2024-03-08] Since Three Dog's reflexive triggered ability doesn't target, Aura tokens
//     created by that ability will be attached to attacking creatures you control with shroud.
//   [2024-03-08] Any enters-the-battlefield abilities of the copied Aura will trigger when the
//     tokens enter the battlefield. Any "as [this Aura] enters the battlefield" or "[this Aura]
//     enters the battlefield with" abilities of the Aura will also work.
//   [2024-03-08] If one of the Aura tokens being created couldn't legally be attached to the
//     appropriate attacking creature (because of an ability like protection from enchantments),
//     that Aura token won't be created.
//   [2024-03-08] If the copied Aura had {X} in its mana cost, X is 0.
//   [2024-03-08] If the copied Aura was copying something else, the tokens enter the battlefield
//     as whatever that Aura was copying.
//
// A `may` whose cost is {2} and a sacrifice (Killer Service's `costSacrifice`); "when you
// sacrifice an Aura this way" is a reflexive trigger (rule 603.12) remembering the sacrificed
// Aura — out of a set of permanents, so copied as it last existed on the battlefield (rule
// 608.2h) — and for each other attacking creature it creates a copy attached to that creature,
// not targeting it (Arna Kennerüd's `attachedTo`: an Aura copy that can't enchant it isn't made).

const TEXT =
  "Whenever you attack, you may pay {2} and sacrifice an Aura attached to Three Dog. When you sacrifice an Aura this way, for each other attacking creature you control, create a token that's a copy of that Aura attached to that creature.";
const REFLEXIVE_TEXT =
  "When you sacrifice an Aura this way, for each other attacking creature you control, create a token that's a copy of that Aura attached to that creature.";

export default defineCard({
  name: "Three Dog, Galaxy News DJ",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 1,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} and sacrifice an Aura attached to Three Dog?",
        cost: "{2}",
        costSacrifice: { filter: { subtype: "Aura", attachedTo: { isSource: true } } },
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          remember: { aura: { set: { thisWay: "sacrificed" } } },
          effect: {
            kind: "for-each-permanent",
            filter: { type: "creature", controlledBy: "you", attacking: true },
            exceptSource: true,
            effect: { kind: "create-token-copy", of: { remembered: "aura" }, count: 1, who: "you", attachedTo: 0 },
          },
          text: REFLEXIVE_TEXT,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
