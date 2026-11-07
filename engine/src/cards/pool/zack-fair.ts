import { defineCard } from "../define.js";

export default defineCard({
  name: "Zack Fair",
  art: "https://scryfall.com/card/fin/45",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 0,
  toughness: 1,
  text: "Zack Fair enters with a +1/+1 counter on it.\n{1}, Sacrifice Zack Fair: Target creature you control gains indestructible until end of turn. Put Zack Fair's counters on that creature and attach an Equipment that was attached to Zack Fair to that creature.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "Zack Fair enters with a +1/+1 counter on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
          // The same number of each kind of counter he had as he was
          // sacrificed (the rulings), read as he last existed (608.2h).
          { kind: "put-counters-of", of: "source", target: 0 },
          // One of the Equipment attached to him as he left, still on the
          // battlefield (rule 400.7), chosen as this resolves.
          {
            kind: "attach",
            target: 0,
            choose: {
              filter: { subtype: "Equipment", wasAttachedTo: "source" },
              prompt: "Attach an Equipment that was attached to Zack Fair",
              upTo: 1,
              min: 1,
            },
          },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice Zack Fair: Target creature you control gains indestructible until end of turn. Put Zack Fair's counters on that creature and attach an Equipment that was attached to Zack Fair to that creature.",
    },
  ],
});
