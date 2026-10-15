/**
 * Reality Fracture (FRA, FRC), batch 3, part c (2026-10-14): the bottom half of the set.
 * Written on the shared table in `harness.ts`.
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
  watchTargets,
  zone,
} from "./harness.js";

describe("Winter, Tormented Loner", () => {
  it("may sacrifice a creature or planeswalker — itself included — and then each opponent sacrifices a creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    let offered: readonly string[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    const winter = enter(game, "Winter, Tormented Loner");
    expect(offered).toContain(bears);
    expect(offered).toContain(winter);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("does nothing to the opponents when you don't sacrifice", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    pickModes(a);
    a.chooseSacrificesFn = () => [];
    enter(game, "Winter, Tormented Loner");
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("gets +1/+0 for each creature and planeswalker card in your graveyard, and no other card", () => {
    const { game } = table();
    const winter = spawn(game, "Winter, Tormented Loner");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Ajani Unrelenting");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Hill Giant", B);
    expect(pt(game, winter)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Vraska, the Cutting Glare", () => {
  it("with six lands, destroys an opponent's permanent and they get the Treasure", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Vraska, the Cutting Glare");
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", B)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("doesn't trigger with five lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [giant]);
    enter(game, "Vraska, the Cutting Glare");
    expect(seen.asked).toBe(0);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Mabel, Valley Hero", () => {
  it("triggers on itself, and offers only creatures that entered this turn", () => {
    const { game, a } = table();
    const old = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // alice's next turn: the Bears are old news
    // A creature that entered this turn, whoever controls it.
    const theirs = enter(game, "Hill Giant", B);
    const seen = watchTargets(a, (offered) => [offered[0].find((id) => id !== theirs) ?? null]);
    const mabel = enter(game, "Mabel, Valley Hero");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(mabel);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).not.toContain(old);
    expect(counters(game, mabel)).toBe(1);
  });
});

describe("Medic's Kitesail", () => {
  it("gives +1/+0, flying and an attack trigger that gains its controller 1 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sail = spawn(game, "Medic's Kitesail");
    lands(game, "Wastes", 2);
    activate(game, sail, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(17);
  });
});

describe("Edgar, Moonlit Sovereign", () => {
  it("gets two counters at your end step only if you cast no spell this turn", () => {
    const { game } = table();
    const edgar = spawn(game, "Edgar, Moonlit Sovereign");
    toStep(game, "end");
    settle(game);
    expect(counters(game, edgar)).toBe(2);

    const second = table();
    const other = spawn(second.game, "Edgar, Moonlit Sovereign");
    const bolt = toHand(second.game, "Lightning Bolt");
    lands(second.game, "Mountain", 1);
    cast(second.game, bolt, { targets: [ref(B)] });
    toStep(second.game, "end");
    settle(second.game);
    expect(counters(second.game, other)).toBe(0);
  });

  it("{4}{G} puts a counter only on your creatures that already have one", () => {
    const { game } = table();
    const edgar = spawn(game, "Edgar, Moonlit Sovereign");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    lands(game, "Forest", 5);
    activate(game, edgar, 0);
    expect(counters(game, countered)).toBe(2);
    expect(counters(game, plain)).toBe(0);
    expect(counters(game, edgar)).toBe(0);
    expect(counters(game, theirs)).toBe(1);
  });
});

describe("Wrath of the Bloodmane", () => {
  it("costs {1} less with a legendary creature, and deals 4", () => {
    const { game } = table();
    spawn(game, "Edgar, Moonlit Sovereign");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    const wrath = toHand(game, "Wrath of the Bloodmane");
    cast(game, wrath, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("costs full price without one", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    const wrath = toHand(game, "Wrath of the Bloodmane");
    expect(() => cast(game, wrath, { targets: [ref(giant)] })).toThrow();
  });
});

describe("Void Extrapolator", () => {
  it("enters prepared with Omit Variables, and gets +1/+1 at threshold", () => {
    const { game } = table();
    const id = enter(game, "Void Extrapolator");
    expect(game.state.objects[id].prepared).toBeDefined();
    const copy = game.state.objects[id].prepared?.copy;
    expect(copy && game.state.objects[copy].cardName).toBe("Omit Variables");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    expect(pt(game, id)).toEqual({ power: 2, toughness: 2 });
    toGraveyard(game, "Wastes");
    expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tetsuko Umezawa, Pursuer", () => {
  it("deals 1 to the controller of an opponent's blocker with power or toughness 1 or less", () => {
    const { game, a, b } = table();
    spawn(game, "Tetsuko Umezawa, Pursuer");
    const attacker = spawn(game, "Hill Giant");
    const wall = spawn(game, "Wall of Wood", B); // 0/3: power 0
    b.declareBlockersFn = () => [{ blocker: wall, attacker }];
    attack(game, a, [attacker]);
    expect(life(game, B)).toBe(19);
  });

  it("ignores a blocker with power and toughness both 2 or more", () => {
    const { game, a, b } = table();
    spawn(game, "Tetsuko Umezawa, Pursuer");
    const attacker = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker }];
    attack(game, a, [attacker]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Fateshaper Aspirant", () => {
  it("returns a legendary card — not a nonlegendary one — from your graveyard", () => {
    const { game, a } = table();
    const legend = toGraveyard(game, "Edgar, Moonlit Sovereign");
    const walker = toGraveyard(game, "Ajani Unrelenting");
    const plain = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [legend]);
    enter(game, "Fateshaper Aspirant");
    expect(seen.offered[0]).toContain(legend);
    expect(seen.offered[0]).toContain(walker);
    expect(seen.offered[0]).not.toContain(plain);
    expect(hand(game)).toContain(legend);
  });

  it("or puts a counter on a creature that gains vigilance and indestructible", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Edgar, Moonlit Sovereign");
    pickModes(a, 1);
    pickTargets(a, bears);
    enter(game, "Fateshaper Aspirant");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Charge the Sanctum", () => {
  it("gives one creature +2/+0, first strike and a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const charge = toHand(game, "Charge the Sanctum");
    cast(game, charge, { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Nissa, Leyline Tamer", () => {
  it("draws on every landfall, but reveals for a creature only on the first resolution each turn", () => {
    const { game } = table();
    spawn(game, "Nissa, Leyline Tamer");
    // Top of the library, top first: a land to draw, then the creature to find.
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    toLibrary(game, "Wastes");
    const before = hand(game).length;
    enter(game, "Forest");
    expect(hand(game)).toHaveLength(before + 1);
    expect(named(game, "Hill Giant", A)).toHaveLength(1);
    enter(game, "Forest");
    expect(hand(game)).toHaveLength(before + 2);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(graveyard(game)).toHaveLength(0);
  });
});
