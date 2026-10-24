/**
 * Dragons of Tarkir (DTK), group A. One test per card whose behaviour is more
 * than a stat line or a copy of an already-tested shape, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Self-Inflicted Wound", () => {
  it("makes the opponent sacrifice a green or white creature, then lose 2 life", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Self-Inflicted Wound"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });

  it("with no green or white creature to sacrifice, no life is lost", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Self-Inflicted Wound"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });
});

describe("Sarkhan's Rage", () => {
  it("deals 2 damage to you only if you control no Dragon", () => {
    const lone = table();
    lands(lone.game, "Mountain", 5);
    cast(lone.game, toHand(lone.game, "Sarkhan's Rage"), { targets: [ref(B)] });
    expect(life(lone.game, B)).toBe(15);
    expect(life(lone.game, A)).toBe(18);

    const { game } = table();
    spawn(game, "Shivan Dragon");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Sarkhan's Rage"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });
});

describe("Sunbringer's Touch", () => {
  it("bolsters by the cards in hand, then gives trample to each creature with a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    lands(game, "Forest", 4);
    const card = toHand(game, "Sunbringer's Touch");
    const x = hand(game).length - 1;
    cast(game, card);
    expect(counters(game, bears)).toBe(x);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(counters(game, wurm)).toBe(0);
    expect(keywords(game, wurm).has("trample")).toBe(false);
  });
});

describe("Stampeding Elk Herd", () => {
  it("gives creatures you control trample only with total power 8 or greater", () => {
    const lone = table();
    const solo = spawn(lone.game, "Stampeding Elk Herd");
    attack(lone.game, lone.a, [solo]);
    expect(keywords(lone.game, solo).has("trample")).toBe(false);

    const { game, a } = table();
    const elk = spawn(game, "Stampeding Elk Herd");
    const wurm = spawn(game, "Craw Wurm");
    attack(game, a, [elk]);
    expect(keywords(game, elk).has("trample")).toBe(true);
    expect(keywords(game, wurm).has("trample")).toBe(true);
  });
});

describe("Circle of Elders", () => {
  it("taps for {C}{C}{C} only with total power 8 or greater", () => {
    const lone = table();
    const alone = spawn(lone.game, "Circle of Elders");
    expect(() => activate(lone.game, alone, 0)).toThrow();

    const { game } = table();
    const circle = spawn(game, "Circle of Elders");
    spawn(game, "Craw Wurm");
    activate(game, circle, 0);
    expect(game.state.objects[circle].tapped).toBe(true);
  });
});

describe("Mirror Mockery", () => {
  it("copies the enchanted attacker as a token that isn't attacking and is exiled at end of combat", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Mirror Mockery"), { targets: [ref(bears)] });
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== bears);
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].isToken).toBe(true);
    expect(game.state.objects[copies[0]].attacking ?? null).toBeNull();
    expect(game.state.objects[bears].attacking).toBe(B);
    toStep(game, "postcombat-main");
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });
});

describe("Necromaster Dragon", () => {
  it("on combat damage to a player, may pay {2} for a Zombie and each opponent mills two", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Necromaster Dragon");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const before = graveyard(game, B).length;
    attack(game, a, [dragon]);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(graveyard(game, B).length).toBe(before + 2);
  });
});

describe("Virulent Plague", () => {
  it("gives creature tokens -2/-2 and leaves nontoken creatures alone", () => {
    const { game } = table();
    spawn(game, "Virulent Plague");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Zombie Token", count: 1 }, []);
    settle(game);
    const [zombie] = named(game, "Zombie Token", B);
    expect(pt(game, zombie)).toEqual({ power: 0, toughness: 0 });
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Zombie Token")).toBe(0);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ambuscade Shaman", () => {
  it("pumps itself and each other creature you control as it enters", () => {
    const { game } = table();
    const shaman = enter(game, "Ambuscade Shaman");
    expect(pt(game, shaman)).toEqual({ power: 4, toughness: 4 });
    const bears = enter(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    const theirs = enter(game, "Grizzly Bears", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Collected Company", () => {
  it("puts up to two creature cards with mana value 3 or less from the top six onto the battlefield", () => {
    const { game, a } = table();
    const wurm = toLibrary(game, "Craw Wurm");
    const lions = toLibrary(game, "Savannah Lions");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const offers: (readonly string[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offers.push(eligible);
      // First the cards to put onto the battlefield, then the rest's order.
      return offers.length === 1 ? [bears, lions] : eligible;
    };
    cast(game, toHand(game, "Collected Company"));
    expect(offers[0]).toContain(bears);
    expect(offers[0]).not.toContain(wurm);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, lions)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("library");
  });
});

describe("Skywise Teachings", () => {
  it("may pay {1}{U} on a noncreature spell for a 2/2 flying Djinn Monk", () => {
    const { game, a } = table();
    spawn(game, "Skywise Teachings");
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Djinn Monk Token", A)).toBe(1);
  });
});
