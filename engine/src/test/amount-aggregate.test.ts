/**
 * The aggregate amount over any set (`AggregateSpec`, need-keys family
 * `effect:amount-aggregate`): a greatest, total or count of one stat over
 * the battlefield, graveyards, exile or the attackers that fired a trigger,
 * unions of them (`in` lists and `plus`), every counter of every kind (`of:
 * "counters"`), a target player's side (`forTarget`), and the greatest of a
 * "this way" set (`thisWay`'s `greatestOf`).
 */

import { describe, expect, it } from "vitest";

import { aggregateMatches, aggregateOver } from "../filter.js";
import type { AggregateSpec } from "../filter.js";
import {
  A,
  B,
  activate,
  attack,
  counters,
  destroy,
  enter,
  graveyard,
  lands,
  life,
  pickPermanents,
  pickTargets,
  pt,
  registryOf,
  spawn,
  table,
  toExile,
  toGraveyard,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("an aggregate over graveyards (Carrion Grub)", () => {
  it("gets +X/+0 from the greatest power among creature cards in your graveyard only", () => {
    const { game } = table();
    const grub = spawn(game, "Carrion Grub");
    expect(pt(game, grub)).toEqual({ power: 0, toughness: 5 });
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm", B); // bob's: not yours
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, grub).power).toBe(2);
    toGraveyard(game, "Craw Wurm");
    expect(pt(game, grub).power).toBe(6);
  });

  it("mills four as it enters", () => {
    const { game } = table();
    enter(game, "Carrion Grub");
    expect(graveyard(game).length).toBe(4);
  });
});

describe("an aggregate excluding itself (Emissary Escort)", () => {
  it("reads the greatest mana value among other artifacts you control", () => {
    const { game } = table();
    const escort = spawn(game, "Emissary Escort");
    expect(pt(game, escort).power).toBe(0);
    spawn(game, "Sol Ring");
    spawn(game, "Wurmcoil Engine", B); // bob's
    expect(pt(game, escort).power).toBe(1);
    const second = spawn(game, "Emissary Escort");
    // Each sees the other's mana value 2, not its own.
    expect(pt(game, escort).power).toBe(2);
    expect(pt(game, second).power).toBe(2);
  });
});

describe("a union of the battlefield and a graveyard (Ambitious Dragonborn)", () => {
  it("enters with the greatest power among creatures you control and creature cards in your graveyard", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm", B);
    const first = enter(game, "Ambitious Dragonborn");
    expect(counters(game, first)).toBe(3);
    toGraveyard(game, "Craw Wurm");
    const second = enter(game, "Ambitious Dragonborn");
    expect(counters(game, second)).toBe(6);
  });
});

describe("a count over graveyards and exile (Crackling Drake)", () => {
  it("counts instant and sorcery cards you own in exile and your graveyard, not face-down ones", () => {
    const { game } = table();
    const drake = spawn(game, "Crackling Drake");
    expect(pt(game, drake)).toEqual({ power: 0, toughness: 4 });
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toExile(game, "Opt");
    toExile(game, "Lightning Bolt", B); // bob's
    expect(pt(game, drake).power).toBe(3);
    const hidden = toExile(game, "Opt");
    game.state.objects[hidden].exiledFaceDown = { lookers: [A] };
    expect(pt(game, drake).power).toBe(3);
  });
});

describe("every counter of every kind (Maester Seymour, Ferrafor)", () => {
  it("Monstrosity X counts every counter among creatures you control", () => {
    const { game } = table();
    const seymour = spawn(game, "Maester Seymour");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    game.state.objects[bears].counters.stun = 1;
    game.state.objects[seymour].counters.shield = 1;
    const opposing = spawn(game, "Hill Giant", B);
    game.state.objects[opposing].counters["+1/+1"] = 5;
    lands(game, "Forest", 5);
    activate(game, seymour, 0);
    expect(counters(game, seymour)).toBe(4);
  });

  it("creates a Saproling for each counter among creatures the target player controls", () => {
    const { game, a } = table();
    const bobs = spawn(game, "Hill Giant", B);
    game.state.objects[bobs].counters["+1/+1"] = 2;
    game.state.objects[bobs].counters.stun = 1;
    const mine = spawn(game, "Grizzly Bears");
    game.state.objects[mine].counters["+1/+1"] = 4;
    pickTargets(a, B);
    enter(game, "Ferrafor, Young Yew");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(3);
  });
});

describe("the attackers that fired the trigger", () => {
  it("Shriekwood Devourer untaps up to the greatest power among the attackers", () => {
    const { game, a } = table();
    spawn(game, "Shriekwood Devourer");
    spawn(game, "Craw Wurm"); // not attacking: not counted
    const bears = spawn(game, "Grizzly Bears");
    const tapped = Array.from({ length: 8 }, () => spawn(game, "Forest", A, { tapped: true }));
    const seen = pickPermanents(a, ...tapped.slice(0, 2));
    attack(game, a, [bears]);
    expect(seen.offered.length).toBeGreaterThan(0);
    expect(tapped.filter((id) => game.state.objects[id].tapped !== true).length).toBe(2);
  });

  it("Shriekwood Devourer offers no more lands than that power", () => {
    const { game, a } = table();
    spawn(game, "Shriekwood Devourer");
    const bears = spawn(game, "Grizzly Bears");
    const tapped = Array.from({ length: 5 }, () => spawn(game, "Forest", A, { tapped: true }));
    pickPermanents(a, ...tapped);
    // Up to 2, the Bears' power: five is refused.
    expect(() => attack(game, a, [bears])).toThrow(/from 0 to 2/);
  });

  it("Vulpine Harvester compares the card's mana value with the attacking Phyrexians' total power", () => {
    const { game, a } = table();
    spawn(game, "Vulpine Harvester");
    const hulk = spawn(game, "Phyrexian Hulk");
    const giant = spawn(game, "Hill Giant"); // not a Phyrexian: not counted
    const wurmcoil = toGraveyard(game, "Wurmcoil Engine");
    pickTargets(a, wurmcoil);
    attack(game, a, [hulk, giant]);
    // 5 power against mana value 6: it stays.
    expect(zone(game, wurmcoil)).toBe("graveyard");
  });

  it("Vulpine Harvester returns a card within that total", () => {
    const { game, a } = table();
    spawn(game, "Vulpine Harvester");
    const hulk = spawn(game, "Phyrexian Hulk");
    const ring = toGraveyard(game, "Mind Stone");
    pickTargets(a, ring);
    attack(game, a, [hulk]);
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("reads an attacker that has left as it last existed, and only its own stint", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    const stint = game.state.objects[wurm].zoneChangeCount ?? 0;
    destroy(game, wurm);
    expect(zone(game, wurm)).toBe("graveyard");
    const spec: AggregateSpec = { aggregate: "sum", of: "power", filter: {}, in: "trigger-batch" };
    // The resolution hands the set's members over as they're read: the
    // Wurm as it last existed in its stint, the Bears as they are.
    const lastKnown = game.state.objects[wurm].lastKnown;
    expect(lastKnown?.zoneChangeCount).toBe(stint);
    const members = [
      { id: wurm, weight: 1, ...(lastKnown !== undefined ? { lastKnown } : {}) },
      { id: bears, weight: 1 },
    ];
    const total = (reads: typeof members): number =>
      aggregateOver(game.state, registryOf(game), aggregateMatches(game.state, registryOf(game), spec, A, { members: () => reads }), spec);
    expect(total(members)).toBe(8);
    // Outside a resolution a batch names nothing.
    expect(aggregateOver(game.state, registryOf(game), aggregateMatches(game.state, registryOf(game), spec, A), spec)).toBe(0);
  });
});

describe("unions count each object once", () => {
  it("a list of zones and a plus that reach the same card", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toExile(game, "Opt");
    const spec: AggregateSpec = {
      aggregate: "count",
      filter: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
      in: ["graveyards", "exile"],
      plus: [{ filter: { type: "instant", ownedBy: "you" }, in: "graveyards" }],
    };
    const n = aggregateOver(game.state, registryOf(game), aggregateMatches(game.state, registryOf(game), spec, A), spec);
    expect(n).toBe(2);
  });
});

describe("the greatest of a this-way set (Heretic's Punishment)", () => {
  it("deals damage equal to the greatest mana value among the milled cards", () => {
    const { game } = table();
    const punishment = spawn(game, "Heretic's Punishment");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Craw Wurm");
    toLibrary(game, "Lightning Bolt");
    lands(game, "Mountain", 4);
    activate(game, punishment, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(14);
  });

  it("deals nothing when every milled card has mana value 0", () => {
    const { game } = table();
    const punishment = spawn(game, "Heretic's Punishment");
    lands(game, "Mountain", 4);
    activate(game, punishment, 0, { targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(20);
  });
});
