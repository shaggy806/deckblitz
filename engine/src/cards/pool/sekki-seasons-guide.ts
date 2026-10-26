import { defineCard } from "../define.js";

// Saviors of Kamigawa. The damage replacement is Anti-Venom's prevent-and-then,
// applied once per damage event (rule 614.5): "that many" is the damage, so
// the tokens come even with too few counters to remove (its ruling — 9 damage,
// 8 counters, 9 tokens). The engine has no unpreventable damage, so the ruling
// about it never arises. The return is Falkenrath Forebear's graveyard ability
// with eight Spirits sacrificed, any Spirits (its ruling).
const DAMAGE_TEXT =
  "If damage would be dealt to Sekki, prevent that damage, remove that many +1/+1 counters from Sekki, and create that many 1/1 colorless Spirit creature tokens.";

export default defineCard({
  name: "Sekki, Seasons' Guide",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 0,
  toughness: 0,
  text: `Sekki enters with eight +1/+1 counters on it.\n${DAMAGE_TEXT}\nSacrifice eight Spirits: Return this card from your graveyard to the battlefield.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 8 } },
      text: "Sekki enters with eight +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "+1/+1", amount: "x" },
            { kind: "create-token", token: "Spirit Token (Colorless)", count: "x" },
          ],
        },
      },
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Spirit" }, count: 8 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: "Sacrifice eight Spirits: Return this card from your graveyard to the battlefield.",
    },
  ],
});
