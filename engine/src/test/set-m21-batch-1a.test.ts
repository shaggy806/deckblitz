/**
 * Core Set 2021 (M21) — group a.
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
  hand,
  keywords,
  lands,
  life,
  loyalty,
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

describe("Volcanic Salvo", () => {
  it("costs {X} less for the total power of your creatures and deals 6 to each of two targets", () => {
    const { game } = table();
    for (let i = 0; i < 5; i++) spawn(game, "Grizzly Bears"); // total power 10
    lands(game, "Mountain", 2);
    const x = spawn(game, "Hill Giant", B);
    const y = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Volcanic Salvo"), { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
  });

  it("isn't castable for {R}{R} with less total power", () => {
    const { game } = table();
    for (let i = 0; i < 4; i++) spawn(game, "Grizzly Bears"); // total power 8
    lands(game, "Mountain", 2);
    const x = spawn(game, "Hill Giant", B);
    expect(() => cast(game, toHand(game, "Volcanic Salvo"), { targets: [ref(x), null] })).toThrow();
  });
});

describe("Garruk, Unleashed", () => {
  it("−2 puts a loyalty counter back only if an opponent controls more creatures", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const garruk = spawn(game, "Garruk, Unleashed");
    loyalty(game, garruk, -2, { atLeast: 4 });
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(1);
    expect(counters(game, garruk, "loyalty")).toBe(3);
  });

  it("−2 adds nothing when the opponent controls no more creatures than you", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", B);
    const garruk = spawn(game, "Garruk, Unleashed");
    loyalty(game, garruk, -2, { atLeast: 4 });
    expect(counters(game, garruk, "loyalty")).toBe(2);
  });
});

describe("Tolarian Kraken", () => {
  it("whenever you draw, may pay {1} to tap a creature", () => {
    const { game, a } = table();
    spawn(game, "Tolarian Kraken");
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0); // pay; then the tap mode
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Transmogrify", () => {
  it("its controller reveals until a creature card and puts it onto the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const victim = spawn(game, "Hill Giant", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B); // on top of the Bears
    cast(game, toHand(game, "Transmogrify"), { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });
});

describe("Silversmote Ghoul", () => {
  it("returns from the graveyard tapped at your end step if you gained 3 life", () => {
    const { game } = table();
    const ghoul = toGraveyard(game, "Silversmote Ghoul");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    toStep(game, "end");
    settle(game);
    expect(zone(game, ghoul)).toBe("battlefield");
    expect(game.state.objects[ghoul].tapped).toBe(true);
  });

  it("stays put after gaining only 2", () => {
    const { game } = table();
    const ghoul = toGraveyard(game, "Silversmote Ghoul");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    toStep(game, "end");
    settle(game);
    expect(zone(game, ghoul)).toBe("graveyard");
  });
});

describe("Angelic Ascension", () => {
  it("the exiled permanent's controller gets the Angel", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Angelic Ascension"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "4/4 Angel Token", B)).toBe(1);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(0);
  });
});

describe("Experimental Overload", () => {
  it("makes an X/X Weird, may return an instant or sorcery, and exiles itself", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const opt = toGraveyard(game, "Opt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    const pick = pickFromZone(a, opt);
    const overload = toHand(game, "Experimental Overload");
    cast(game, overload);
    const [weird] = named(game, "X/X Blue Red Weird Token", A);
    expect(pt(game, weird)).toEqual({ power: 2, toughness: 2 });
    expect(pick.offered).not.toContain(overload);
    expect(zone(game, opt)).toBe("hand");
    expect(zone(game, overload)).toBe("exile");
  });
});

describe("Archfiend's Vessel", () => {
  it("returned from your graveyard, it's exiled for a 5/5 Demon", () => {
    const { game } = table();
    const vessel = toGraveyard(game, "Archfiend's Vessel");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(vessel)]);
    settle(game);
    expect(zone(game, vessel)).toBe("exile");
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(1);
  });

  it("cast from the hand, it stays", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const vessel = toHand(game, "Archfiend's Vessel");
    cast(game, vessel);
    expect(zone(game, vessel)).toBe("battlefield");
    expect(tokensNamed(game, "5/5 Demon Token")).toBe(0);
  });

  it("an opponent's reanimation from your graveyard isn't from their graveyard", () => {
    const { game } = table();
    const vessel = toGraveyard(game, "Archfiend's Vessel");
    game.debugApplyEffect(B, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(vessel)]);
    settle(game);
    expect(zone(game, vessel)).toBe("battlefield");
    expect(tokensNamed(game, "5/5 Demon Token")).toBe(0);
  });
});

describe("Track Down", () => {
  it("draws the revealed card when it's a creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Track Down"));
    expect(zone(game, bears)).toBe("hand");
  });

  it("leaves a noncreature, nonland card on top", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const opt = toLibrary(game, "Opt");
    cast(game, toHand(game, "Track Down"));
    expect(zone(game, opt)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(opt);
  });
});

describe("Frantic Inventory", () => {
  it("draws one plus one per Frantic Inventory in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    toGraveyard(game, "Frantic Inventory");
    toGraveyard(game, "Frantic Inventory");
    toGraveyard(game, "Frantic Inventory", B);
    const spell = toHand(game, "Frantic Inventory");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Malefic Scythe", () => {
  it("enters with a soul counter and gains one when the equipped creature dies", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 2);
    const scythe = toHand(game, "Malefic Scythe");
    cast(game, scythe);
    expect(counters(game, scythe, "soul")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, scythe, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    destroy(game, bears);
    expect(counters(game, scythe, "soul")).toBe(2);
    const giant = spawn(game, "Hill Giant");
    toStep(game, "postcombat-main");
    activate(game, scythe, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Tempered Veteran", () => {
  it("its {W} ability targets only a creature with a +1/+1 counter", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const veteran = spawn(game, "Tempered Veteran");
    const plain = spawn(game, "Grizzly Bears");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters["+1/+1"] = 1;
    expect(() => activate(game, veteran, 0, { targets: [ref(plain)] })).toThrow();
    activate(game, veteran, 0, { targets: [ref(countered)] });
    expect(counters(game, countered)).toBe(2);
  });
});

describe("Waker of Waves", () => {
  it("opponents' creatures get -1/-0, and it can be discarded to dig two", () => {
    const { game, a } = table();
    spawn(game, "Waker of Waves");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 2 });

    lands(game, "Island", 2);
    const waker = toHand(game, "Waker of Waves");
    const top = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, top);
    activate(game, waker, 0);
    expect(zone(game, waker)).toBe("graveyard");
    expect(zone(game, top)).toBe("hand");
  });
});

describe("Falconer Adept", () => {
  it("attacking, it makes a tapped and attacking Bird", () => {
    const { game, a } = table();
    const adept = spawn(game, "Falconer Adept");
    attack(game, a, [adept]);
    expect(tokensNamed(game, "Bird Token", A)).toBe(1);
    expect(life(game, B)).toBe(20 - 2 - 1);
  });
});

describe("Celestial Enforcer", () => {
  it("activates only while you control a creature with flying", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const enforcer = spawn(game, "Celestial Enforcer");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, enforcer, 0, { targets: [ref(bears)] })).toThrow();
    spawn(game, "Suntail Hawk");
    activate(game, enforcer, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Gnarled Sage", () => {
  it("gets +0/+2 and vigilance once you've drawn two cards", () => {
    const { game } = table();
    const sage = spawn(game, "Gnarled Sage");
    // Alice drew one card in her draw step already.
    expect(pt(game, sage)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, sage).has("vigilance")).toBe(false);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    expect(pt(game, sage)).toEqual({ power: 4, toughness: 6 });
    expect(keywords(game, sage).has("vigilance")).toBe(true);
  });
});

describe("Dire Fleet Warmonger", () => {
  it("sacrificing another creature at beginning of combat gives +2/+2 and trample", () => {
    const { game, a } = table();
    const warmonger = spawn(game, "Dire Fleet Warmonger");
    const fodder = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      expect(eligible).not.toContain(warmonger);
      return [fodder];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(pt(game, warmonger)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, warmonger).has("trample")).toBe(true);
  });
});
