import { defineCard } from "../define.js";

// Bloodrush as Scab-Clan Charger's; the return as Killian's Confidence's
// batched trigger (once per player dealt damage — the first ruling) with
// Blood Operative's intervening "if this card is in your graveyard", whose
// `sameObject` keeps a Shaman that left and came back from being returned.
const BLOODRUSH_TEXT = "Bloodrush — {1}{R}, Discard this card: Target attacking creature gets +3/+1 until end of turn.";
const RETURN_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, if this card is in your graveyard, you may pay {3}. If you do, return this card to your hand.";

export default defineCard({
  name: "Pyrewild Shaman",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 3,
  toughness: 1,
  text: `${BLOODRUSH_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: BLOODRUSH_TEXT,
      zone: "hand",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3} to return Pyrewild Shaman to your hand?",
        cost: "{3}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
