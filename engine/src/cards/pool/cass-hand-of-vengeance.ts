import { defineCard } from "../define.js";

// EDHREC rank 11135.
//
// Rulings:
//   - You can't return Aura cards that can't legally be attached to the
//     target creature.
//
// The creature that died is read as it last existed (rule 603.10a), whose
// snapshot keeps what was attached to it (`LastKnownInfo.attachments`), so the
// intervening "if" (rule 603.4) asks about that moment as the trigger
// resolves too. "Aura cards that were attached to it" are the cards those
// Auras became in your graveyard, put there with it or after it as a
// state-based action (rule 400.7f; `wasAttachedTo`, 704.5m), and only those
// that could enchant the target are offered (303.4i). Its Equipment stayed on
// the battlefield unattached (704.5n); "that creature" is the target.
const TEXT =
  "Whenever Cass or another creature you control dies, if it was enchanted or equipped, return any number of Aura cards that were attached to it from your graveyard to the battlefield attached to target creature, then attach any number of Equipment that were attached to it to that creature.";

export default defineCard({
  name: "Cass, Hand of Vengeance",
  art: "https://scryfall.com/card/pip/97",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 4,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", anyOf: [{ enchanted: true }, { equipped: true }] },
      },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            filter: { subtype: "Aura", wasAttachedTo: "trigger-object" },
            destination: "battlefield",
            count: 99,
            upTo: true,
            attachedTo: 0,
          },
          {
            kind: "attach",
            target: 0,
            attachment: {
              choose: { subtype: "Equipment", wasAttachedTo: "trigger-object" },
              prompt: "Attach any number of Equipment that were attached to it to that creature",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
