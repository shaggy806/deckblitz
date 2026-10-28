/**
 * Group B of the variable-target-count batch: groups bounded by a trigger's
 * value (monstrosity X, cards looked at while scrying, cards discarded, a die
 * roll), by a count read as an ability is activated, by the times a creature
 * has mutated, and by a total mana value.
 */

import { describe, expect, it } from "vitest";

import { goadersOf } from "../goad.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Death Kiss", () => {
  it("doubles an opponent's creature attacking another opponent, not one attacking you", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Death Kiss");
    const atCarol = spawn(game, "Grizzly Bears", B);
    const atMe = spawn(game, "Grizzly Bears", B);
    toStep(game, "precombat-main", B);
    b.declareAttackersFn = () => [
      { attacker: atCarol, defender: C },
      { attacker: atMe, defender: A },
    ];
    toStep(game, "postcombat-main", B);
    expect(pt(game, atCarol).power).toBe(4);
    expect(pt(game, atMe).power).toBe(2);
  });

  it("goads up to X target creatures as it becomes monstrous", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const kiss = spawn(game, "Death Kiss");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return bears.slice(0, 2).map(ref);
    };
    activate(game, kiss, 0, { x: 2 });
    expect(max).toBe(2);
    expect(counters(game, kiss)).toBe(2);
    expect(bears.map((id) => goadersOf(game.state, registryOf(game), id))).toEqual([[A], [A], []]);
  });
});

describe("Endurance Bobblehead", () => {
  it("bounds its group by the Bobbleheads you control", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const bobble = spawn(game, "Endurance Bobblehead");
    spawn(game, "Endurance Bobblehead");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: bobble, abilityIndex: 1, targets: bears.map(ref) }),
    ).toMatch(/at most 2/);
    activate(game, bobble, 1, { targets: bears.slice(0, 2).map(ref) });
    expect(bears.map((id) => pt(game, id).power)).toEqual([3, 3, 2]);
    expect(keywords(game, bears[0]).has("indestructible")).toBe(true);
    expect(keywords(game, bears[2]).has("indestructible")).toBe(false);
  });
});

describe("Rot-Curse Rakshasa", () => {
  it("renews from the graveyard, giving each of X targets a decayed counter", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const rakshasa = toGraveyard(game, "Rot-Curse Rakshasa");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    activate(game, rakshasa, 0, { x: 2, targets: bears.map(ref) });
    expect(zone(game, rakshasa)).toBe("exile");
    expect(bears.map((id) => counters(game, id, "decayed"))).toEqual([1, 1]);
    expect(keywords(game, bears[0]).has("decayed")).toBe(true);
  });
});

describe("Elvish Mariner", () => {
  it("taps up to as many nonland permanents as cards it looked at", () => {
    const { game, a } = table();
    const mariner = spawn(game, "Elvish Mariner");
    const rocks = [spawn(game, "Sol Ring", B), spawn(game, "Sol Ring", B)];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return [ref(rocks[0])];
    };
    attack(game, a, [mariner]);
    expect(max).toBe(1);
    expect(game.state.objects[rocks[0]].tapped).toBe(true);
    expect(game.state.objects[rocks[1]].tapped).toBe(false);
  });
});

describe("Seasoned Cryomancer", () => {
  it("taps and stuns up to as many creatures as nonland cards discarded", () => {
    const { game, a } = table();
    const forest = toHand(game, "Forest");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [forest, bolt];
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return [ref(bears[0])];
    };
    enter(game, "Seasoned Cryomancer");
    expect(max).toBe(1);
    expect(game.state.objects[bears[0]].tapped).toBe(true);
    expect(counters(game, bears[0], "stun")).toBe(1);
    expect(counters(game, bears[1], "stun")).toBe(0);
  });

  it("has no reflexive trigger when only lands were discarded", () => {
    const { game, a } = table();
    const lands2 = [toHand(game, "Forest"), toHand(game, "Forest")];
    a.chooseDiscardsFn = () => lands2;
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    spawn(game, "Grizzly Bears", B);
    enter(game, "Seasoned Cryomancer");
    expect(asked).toBe(0);
  });
});

describe("The Super Hero Civil War", () => {
  it("chapter I takes up to two creatures with total mana value 6 or less", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _name, _specs, options) => {
      offered = options[0] ?? [];
      return [ref(bears), ref(giant)];
    };
    const saga = enter(game, "The Super Hero Civil War");
    expect(offered.length).toBe(3);
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, giant)).toBe(A);
    expect(controller(game, dragon)).toBe(B);
    expect(zone(game, saga)).toBe("battlefield");
  });
});

describe("Scout for Survivors", () => {
  it("returns the cards and puts a +1/+1 counter on each", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const lions = toGraveyard(game, "Savannah Lions");
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Scout for Survivors"), { targets: [ref(lions), ref(bears)] });
    expect([zone(game, lions), zone(game, bears)]).toEqual(["battlefield", "battlefield"]);
    expect([counters(game, lions), counters(game, bears)]).toEqual([1, 1]);
  });
});

describe("Miasma Demon", () => {
  it("gives up to as many creatures -2/-2 as cards discarded", () => {
    const { game, a } = table();
    const discards = [toHand(game, "Forest"), toHand(game, "Forest")];
    a.chooseDiscardsFn = () => discards;
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return bears.slice(0, 2).map(ref);
    };
    enter(game, "Miasma Demon");
    expect(max).toBe(2);
    expect(bears.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield"]);
  });

  it("does nothing more when no card is discarded", () => {
    const { game, a } = table();
    a.chooseDiscardsFn = () => [];
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    const before = hand(game).length;
    spawn(game, "Grizzly Bears", B);
    enter(game, "Miasma Demon");
    expect(asked).toBe(0);
    expect(hand(game).length).toBe(before);
  });
});

describe("Tocasia, Dig Site Mentor", () => {
  it("gives your creatures vigilance and a {T}: Surveil 1 ability", () => {
    const { game } = table();
    spawn(game, "Tocasia, Dig Site Mentor");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    const offer = game.legalActions(A).find((o) => o.kind === "activate-ability" && o.source === bears);
    if (offer?.kind !== "activate-ability") throw new Error("no granted ability offered");
    game.dispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: offer.abilityIndex, targets: [] });
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("returns artifact cards with total mana value 10 or less from the graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Plains", 3);
    lands(game, "Island", 3);
    const tocasia = toGraveyard(game, "Tocasia, Dig Site Mentor");
    const ring = toGraveyard(game, "Sol Ring");
    const bobble = toGraveyard(game, "Endurance Bobblehead");
    activate(game, tocasia, 0, { targets: [ref(ring), ref(bobble)] });
    expect([zone(game, ring), zone(game, bobble), zone(game, tocasia)]).toEqual(["battlefield", "battlefield", "exile"]);
  });
});

describe("Archipelagore", () => {
  it("taps up to as many creatures as times it has mutated, and they stay tapped", () => {
    const { game, a } = table();
    const host = spawn(game, "Grizzly Bears");
    lands(game, "Island", 6);
    const victims = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    pickModes(a, 0);
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return [ref(victims[0])];
    };
    cast(game, toHand(game, "Archipelagore"), { overload: true, targets: [ref(host)] });
    expect(max).toBe(1);
    expect(game.state.objects[victims[0]].tapped).toBe(true);
    expect(game.state.objects[victims[1]].tapped).toBe(false);
  });
});

describe("Vitality Hunter", () => {
  it("puts a lifelink counter on each of up to X targets as it becomes monstrous", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const hunter = spawn(game, "Vitality Hunter");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let max: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      max = typeof spec === "object" && spec.kind === "any-number" ? spec.max : undefined;
      return bears.slice(0, 2).map(ref);
    };
    activate(game, hunter, 0, { x: 2 });
    expect(max).toBe(2);
    expect(bears.map((id) => counters(game, id, "lifelink"))).toEqual([1, 1, 0]);
    expect(keywords(game, bears[0]).has("lifelink")).toBe(true);
  });
});

describe("Prismatic Boon", () => {
  it("asks for one color and protects every target from it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [3]; // red
    };
    cast(game, toHand(game, "Prismatic Boon"), { x: 2, targets: bears.map(ref) });
    expect(asked).toBe(1);
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", A);
    lands(game, "Mountain", 1);
    for (const bear of bears) {
      expect(game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(bear)] })).not.toBeNull();
    }
  });
});

describe("Ancient Brass Dragon", () => {
  it("puts creature cards from any graveyard onto the battlefield under your control, within the roll", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Ancient Brass Dragon");
    const lions = toGraveyard(game, "Savannah Lions", B);
    let cap: unknown;
    a.chooseTargetsFn = (_view, _name, specs) => {
      const spec = specs[0];
      cap = typeof spec === "object" && spec.kind === "any-number" ? spec.maxTotalManaValue : undefined;
      return [ref(lions)];
    };
    attack(game, a, [dragon]);
    expect(cap).toBe(game.state.lastRoll!.total);
    expect(zone(game, lions)).toBe("battlefield");
    expect(controller(game, lions)).toBe(A);
    expect(graveyard(game, B)).not.toContain(lions);
  });
});
