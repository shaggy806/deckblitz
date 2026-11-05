import { defineCard } from "../define.js";

// EDHREC rank 7931. Damage first, all of it; then each target is asked about
// the damage it was actually dealt (a prevented hit doesn't count).

export default defineCard({
  name: "Aurelia's Fury",
  manaCost: "{X}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: "Aurelia's Fury deals X damage divided as you choose among any number of targets. Tap each creature dealt damage this way. Players dealt damage this way can't cast noncreature spells this turn.",
  targets: [{ kind: "any-number", of: "any-target", max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-divided", from: 0 },
      {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "conditional",
              condition: {
                kind: "all",
                of: [
                  { kind: "damage-dealt-this-way", to: 0 },
                  { kind: "target", index: 0, filter: { type: "creature" } },
                ],
              },
              then: { kind: "tap", target: 0 },
            },
            {
              kind: "conditional",
              condition: { kind: "damage-dealt-this-way", to: 0, player: true },
              then: {
                kind: "prohibit",
                who: 0,
                spells: { filter: { notTypes: ["creature"] }, label: "noncreature spells" },
              },
            },
          ],
        },
      },
    ],
  },
});
