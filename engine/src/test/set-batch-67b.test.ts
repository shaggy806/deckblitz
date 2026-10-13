/**
 * The set walk, batch 67, part b (2026-10-12): Tarkir: Dragonstorm and
 * Aetherdrift. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Knockout Maneuver", () => {
  it("puts the counter on first, so the damage counts it", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Knockout Maneuver"), { targets: [ref(bears), ref(giant)] });
    expect(counters(game, bears)).toBe(1);
    // 3 damage kills the 3/3; a one-sided fight, so the Bears take none.
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Synchronized Charge", () => {
  it("one target gets both counters; creatures with counters gain vigilance and trample, others don't", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Synchronized Charge"), { targets: [ref(bears), null] });
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, giant).has("trample")).toBe(false);
  });

  it("two targets get one each", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Synchronized Charge"), { targets: [ref(bears), ref(giant)] });
    expect([counters(game, bears), counters(game, giant)]).toEqual([1, 1]);
    expect(keywords(game, giant).has("vigilance")).toBe(true);
  });
});

describe("Desperate Measures", () => {
  it("draws two when your creature dies this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const elves = spawn(game, "Llanowar Elves");
    const before = hand(game).length;
    // +1/-1 on a 1/1: it dies to state-based actions after the spell.
    cast(game, toHand(game, "Desperate Measures"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("draws nothing when an opponent's creature dies under its own controller", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const elves = spawn(game, "Llanowar Elves", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Desperate Measures"), { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Ainok Wayfarer", () => {
  it("takes a milled land into your hand, and then gets no counter", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, forest);
    const ainok = enter(game, "Ainok Wayfarer");
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, ainok)).toBe(0);
  });

  it("declining the land puts the counter on", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickModes(a);
    const ainok = enter(game, "Ainok Wayfarer");
    expect(zone(game, forest)).toBe("graveyard");
    expect(counters(game, ainok)).toBe(1);
  });

  it("no land milled: the counter, without asking", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const ainok = enter(game, "Ainok Wayfarer");
    expect(asked).toBe(0);
    expect(counters(game, ainok)).toBe(1);
  });
});

describe("Dragonclaw Strike", () => {
  it("doubles power and toughness, then fights up to one creature", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Dragonclaw Strike"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with no second target, just the doubling", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Dragonclaw Strike"), { targets: [ref(bears), null] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Lasyd Prowler", () => {
  it("renew puts a counter per land card in your graveyard on the target", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    const prowler = toGraveyard(game, "Lasyd Prowler");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, prowler, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
    expect(zone(game, prowler)).toBe("exile");
  });

  it("may mill as many cards as you control lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    pickModes(a, 0);
    const before = graveyard(game).length;
    enter(game, "Lasyd Prowler");
    expect(graveyard(game).length).toBe(before + 3);
  });
});

describe("Narset, Jeskai Waymaster", () => {
  it("discards your hand and draws one per spell you cast this turn", () => {
    const { game, a } = table();
    spawn(game, "Narset, Jeskai Waymaster");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const kept = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant"), toHand(game, "Grizzly Bears")];
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(kept.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(hand(game).length).toBe(2);
  });
});

describe("Mu Yanling, Wind Rider", () => {
  it("makes a Vehicle that has flying, and draws when fliers connect", () => {
    const { game, a } = table();
    enter(game, "Mu Yanling, Wind Rider");
    const [vehicle] = named(game, "Vehicle Token");
    expect(vehicle).toBeDefined();
    expect(keywords(game, vehicle).has("flying")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    const drake = spawn(game, "Wind Drake");
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before);
    toStep(game, "precombat-main");
    const now = hand(game).length;
    attack(game, a, [drake, bears]);
    // Once for the player, however many fliers dealt the damage.
    expect(hand(game).length).toBe(now + 1);
  });
});

describe("Daretti, Rocketeer Engineer", () => {
  it("has power equal to the greatest mana value among your artifacts", () => {
    const { game } = table();
    const daretti = spawn(game, "Daretti, Rocketeer Engineer");
    expect(pt(game, daretti)).toEqual({ power: 0, toughness: 5 });
    spawn(game, "Sol Ring");
    spawn(game, "Solemn Simulacrum");
    expect(pt(game, daretti)).toEqual({ power: 4, toughness: 5 });
  });

  it("sacrificing an artifact as it enters returns the chosen artifact card", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const wurm = toGraveyard(game, "Wurmcoil Engine");
    pickTargets(a, wurm);
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [ring];
    enter(game, "Daretti, Rocketeer Engineer");
    expect(zone(game, ring)).toBe("graveyard");
    expect(named(game, "Wurmcoil Engine")).toHaveLength(1);
  });

  it("declining the sacrifice returns nothing", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const wurm = toGraveyard(game, "Wurmcoil Engine");
    pickTargets(a, wurm);
    pickModes(a);
    enter(game, "Daretti, Rocketeer Engineer");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Coalstoke Gearhulk", () => {
  it("reanimates from any graveyard with a finality counter, menace, deathtouch and haste, exiled at your end step", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Coalstoke Gearhulk");
    const [stolen] = named(game, "Grizzly Bears", A);
    expect(stolen).toBeDefined();
    expect(counters(game, stolen, "finality")).toBe(1);
    for (const k of ["menace", "deathtouch", "haste"]) expect(keywords(game, stolen).has(k)).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(game.state.zones.shared.exile.some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
  });
});

describe("Aatchik, Emerald Radian", () => {
  it("counts an artifact creature card once, and drains when another Insect dies", () => {
    const { game } = table();
    toGraveyard(game, "Ornithopter");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    const aatchik = enter(game, "Aatchik, Emerald Radian");
    expect(tokensNamed(game, "Insect Token", A)).toBe(3);
    destroy(game, named(game, "Insect Token")[0]);
    expect(counters(game, aatchik)).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Shiko, Paragon of the Way", () => {
  it("exiles a cheap nonland card from your graveyard and casts a copy free", () => {
    const { game, a } = table();
    const opt = toGraveyard(game, "Divination");
    pickTargets(a, opt);
    let offeredFree = false;
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      offeredFree = offer.free === true;
      return { type: "cast-spell", player: A, card: way.card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    const before = hand(game).length;
    enter(game, "Shiko, Paragon of the Way");
    expect(offeredFree).toBe(true);
    expect(zone(game, opt)).toBe("exile");
    expect(hand(game).length).toBe(before + 2);
  });

  it("can't take a card with mana value 4 or more, nor a land", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    const elves = toGraveyard(game, "Llanowar Elves");
    let offered: readonly string[] = [];
    a.chooseTargetsFn = (_v, _n, _specs, options) => {
      offered = options[0].map((t) => (t.kind === "object" ? t.object : t.player));
      return [ref(bears)];
    };
    enter(game, "Shiko, Paragon of the Way");
    expect(offered).toContain(bears);
    expect(offered).toContain(elves);
    expect(offered).not.toContain(giant);
    expect(offered).not.toContain(forest);
  });
});

describe("Pactdoll Terror", () => {
  it("drains on its own entry and another artifact's", () => {
    const { game } = table();
    enter(game, "Pactdoll Terror");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    enter(game, "Sol Ring");
    expect(life(game, B)).toBe(18);
    enter(game, "Grizzly Bears");
    expect(life(game, B)).toBe(18);
  });
});

describe("Rakshasa's Bargain", () => {
  it("puts two of the top four into your hand and the rest into your graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Hill Giant"), toLibrary(game, "Opt"), toLibrary(game, "Shock")];
    pickFromZone(a, top[0], top[2]);
    cast(game, toHand(game, "Rakshasa's Bargain"));
    expect([top[0], top[2]].map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect([top[1], top[3]].map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
  });
});

describe("Dredger's Insight", () => {
  it("gains 1 life when an artifact or creature card leaves your graveyard", () => {
    const { game } = table({ deck: "Forest" });
    spawn(game, "Dredger's Insight");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    expect(life(game, A)).toBe(21);
    const forest = toGraveyard(game, "Forest");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(forest)]);
    settle(game);
    expect(life(game, A)).toBe(21);
  });
});
